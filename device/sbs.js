/***************************
  Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

      http://aws.amazon.com/apache2.0/

  or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

  Note: Other license terms may apply to certain, identified software files contained within or
  distributed with the accompanying software if such terms are included in the directory containing
  the accompanying software. Such other license terms will then apply in lieu of the terms of the
  software license above.
 **************************/

var five = require("johnny-five");
var LCDScreen = require("./components/grove-lcd.js");
var TempSensor = require("./components/grove-temp-sensor.js");
var SoundSensor = require("./components/grove-sound-sensor.js");
var FlowSensor = require("./components/grove-flow-sensor.js");
var AnalogFlowSensor = require("./components/grove-flow-sensor-analog.js");
var UltrasonicRanger = require("./components/grove-ultrasonic-ranger.js");
var awsIot = require("aws-iot-device-sdk");
var Edison = require("edison-io");
var os = require('os');
var sleep = require('sleep');
var async = require('async');
var shadowAccess = require('semaphore')(1);
var configUpdate = require('semaphore')(1);
var config = require("./device.json");
var ifaces = os.networkInterfaces();
var bus = 6;
var defaultFreq = 25;
var defaultMultiplier = 2.25;
var kegdata = {};
var components = null;
var lcd = null;

const commandLineArgs = require('command-line-args')
const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false },
  { name: 'region', alias: 'r', type: String, defaultValue: config.region },
  { name: 'unitid', alias: 'u', type: String, defaultValue: config.thingName }
]
const options = commandLineArgs(optionDefinitions)

if (options.verbose) {
  var board = new five.Board({
    io: new Edison()
  });
} else {
  var board = new five.Board({
    io: new Edison(),
    repl: false,
    debug: false
  });
}

var PUBLISH_TOPIC = config.intervals.topic;
var PUBLISH_SHADOW = config.intervals.shadow;

var unitID = options.unitid;
var device = awsIot.thingShadow(
    {
      keyPath: config.certs.privateKey,
      certPath: config.certs.certificate,
      caPath: config.certs.caCert,
      clientId: options.unitid,
      region: options.region
    },
    {
      operationTimeout: 30000 // 30 seconds
    }
);

var logs = [];
var data = [];

var topic = config.topicName +"/"+unitID;
var logtopic = config.logTopic+"/"+unitID;
var colors = {
  "green": [ 0, 255, 0 ],
  "red": [ 255, 0, 0 ],
  "orange": [ 150, 150, 0 ],
  "blue": [ 0, 0, 255 ],
}

function initLCD() {
  lcd = new LCDScreen(config);
}

function initSensors(callback) {
  configUpdate.take(function() {
    try {
      components = {
        "leds": {
          "blue": new five.Led(config.components.leds.blue),
          "green": new five.Led(config.components.leds.green),
          "red": new five.Led(config.components.leds.red)
        },
        "lcd": lcd,
        "sensors": {
          "Sound": new SoundSensor(
            config.components.sensors.Sound.pin, 
            ('freq' in config.components.sensors.Sound) ? config.components.sensors.Sound.freq : defaultFreq  
          ),
          "Temperature": new TempSensor(
            config.components.sensors.Temperature.pin, 
            ('freq' in config.components.sensors.Temperature) ? config.components.sensors.Temperature.freq : defaultFreq  
          ),
          "Flow": new AnalogFlowSensor(
            config.components.sensors.Flow.pin, 
            ('freq' in config.components.sensors.Flow) ? config.components.sensors.Flow.freq : defaultFreq, 
            ('multiplier' in config.components.sensors.Flow) ? config.components.sensors.Flow.multiplier : defaultMultiplier  
          )
        }
      }   
    } catch (e) {
      log('ErrorInit',e);
    }
    callback();
  });
}

function log(type, message) {
  if (options.verbose) {
    board.info(type,message);
  }
  logs.push({'type':type,'message':message});
}

function generatePayload() {
  var payload = {
    "version": "5",
    "deviceId": options.unitid,
    "data": data
  }
  data = [];
  if (options.verbose) {
    board.info("Payload",JSON.stringify(payload));
  }
  return JSON.stringify(payload);
}

function initReaders() {
  async.forEach(Object.keys(components.sensors), function (key, callback){
    log("Init",key+" @ "+components.sensors[key].readInterval+"ms");
    board.loop(components.sensors[key].readInterval, function() {
      try {
        var val = components.sensors[key].read();
      } catch (e) {
        log("Error",e);
      }
      if (val>=0) {
        data.push({
          "timestamp":new Date().getTime(),
          "value":val,
          "type":key
        })
      }
    });
  }, function(err) {
    log("Init","Complete");
  });
}
 
function recurseUpdate(initial, update){
    for(prop in initial){
        if({}.hasOwnProperty.call(initial, prop) && {}.hasOwnProperty.call(update, prop)){
            if(typeof initial[prop] === 'object' && typeof update[prop] === 'object'){
                recurseUpdate(initial[prop], update[prop]);
            }
            else{
                initial[prop] = update[prop];
            }
        }
    }
}

function updateFromShadow(shadow, isDelta) {
  var updateShadow = false;
  update = (isDelta) ? shadow.state : shadow.state.desired;

  if (update == null) { // we can ignore message if we have no desired object and its not an update
    return;
  }

  if ('kegdata' in update) {
    if (Object.keys(kegdata).length == 0) { // deal wth empty initial kegdata
      kegdata = update.kegdata;
    }
    else {
      recurseUpdate(kegdata, update.kegdata);
    }
    lcd.updateKegData(kegdata);
    updateShadow = true;
  }
  
  if ('config' in update) {
    recurseUpdate(config, update.config);
    lcd.updateConfig(config, true);
    updateShadow = true;
  }

  if (updateShadow) {
    shadowAccess.take(function() {
      var sbsState = {
        "state" : {
          "reported": {
            "kegdata": kegdata,
            "config": config
          }
        }
      };
      device.update( options.unitid, sbsState );
    });
  }
}

function startupRoutine(callback) {
  /* Setup the components */
  var token;
  try {
    log(options.unitid+"init",JSON.stringify(options));
    lcd.useChar("heart");
    board.pinMode("A0", five.Pin.INPUT);
    log("Board",ifaces);
    lcd.printRGB(colors.blue,"SBS 5.0 Starting","IP:"+ifaces.wlan0[0].address);
    sleep.sleep(3);
    lcd.printRGB(colors.blue,"Location set to",config.location);
    sleep.sleep(3);
    lcd.printRGB(colors.red,"Connecting...","to AWS IoT");
    log("AWS IoT","Connecting to AWS IoT...");

    try {
      device.on("connect", function() {
        device.register(options.unitid, { enableVersioning: false }, function() {  // disable versioning for device shadow updating, as we also have lambda updating shadow

            shadowAccess.take(function() {
              token = device.get(options.unitid);
            });

            shadowAccess.take(function() {
              var sbsState = {
                "state" : {
                  "reported": {
                    "device": {
                      "config": config
                    },                  
                  }
                }
              };
              token = device.update( options.unitid, sbsState );
            });
          });
          log("AWS IoT","Connected to AWS IoT...");
          lcd.printRGB(colors.green,"Connected!","TO AWS IoT");
        });

        device.on('status',
        function(thingName, stat, clientToken, stateObject) {
           console.log('received ' + stat + ' on ' + thingName + ' with token ' + clientToken + ': ' +
                       JSON.stringify(stateObject));
           updateFromShadow(stateObject, false);
           shadowAccess.leave();

          // On initial start we wait until device shadow over-ride config is read before initalizing sensors 
           if (! configUpdate.available()) {
             configUpdate.leave();
           }
           
        });

        device.on('delta',
        function(thingName, stateObject) {
           console.log('received delta on '+thingName+': '+
                       JSON.stringify(stateObject));
           updateFromShadow(stateObject, true);
        });

        device.on('timeout',
        function(thingName, clientToken) {
           console.log('received timeout on '+thingName+
                       ' with token: '+ clientToken);
           shadowAccess.leave();
        });

        device.on('error',
        function(error) {
          console.log('recieved error: ' + error);
        });

    } catch (e) {
      log("AWS IoT","Failed to connect."+e);
    }
  } catch (e) {
    log('Error',e);
  }
  callback();
}

//
// MAIN
//


board.on("ready", function() {
  initLCD();
  lcd.startAutoScroll();
  configUpdate.take(function() {
    async.parallel([startupRoutine, initSensors], function() { 
      initReaders();
      board.loop(PUBLISH_TOPIC, function() {
        try {
          for (var i = 0, len = logs.length; i < len; i++) {
            device.publish(logtopic, JSON.stringify(logs[i]));
            if (options.verbose) {
              board.info('PublishLog', JSON.stringify(logs[i]));
            }
          }
          logs = [];
        } catch (e) {
          if (options.verbose) {
            board.info('ErrorLog','Error publishing log.' + e);
          }
        }
        components.leds.green.on();
        components.leds.blue.off();
        device.publish(topic, generatePayload());
        setTimeout(function() {
          components.leds.green.off();
        }, 100);
      });
      board.loop(PUBLISH_SHADOW, function () {
        var sensordata = {};
        for (var sensor in components.sensors) {
          sensordata[sensor] = components.sensors[sensor].read()
        }
        sensordata.Humidity = 43; // Hack - hard-coded for now until humidity sensor can be made to work
        kegdata.sensors = sensordata
        shadowAccess.take(function () {
          var sbsState = {
            "state": {
              "reported": {
                "kegdata": {
                  "sensors": kegdata.sensors
                }
              }
            }
          };
          device.update(options.unitid, sbsState);
        });
      });

    });
  });
});
