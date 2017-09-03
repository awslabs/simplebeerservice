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
var UltrasonicRanger = require("./components/grove-ultrasonic-ranger.js");
var awsIot = require("aws-iot-device-sdk");
var Edison = require("edison-io");
var os = require('os');
var sleep = require('sleep');
var async = require('async');
var shadowAccess = require('semaphore')(1);
var config = require("./device.json");
var ifaces = os.networkInterfaces();
var bus = 6;
var defaultFreq = 25;

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

var PUBLISH_INTERVAL = config.intervals.publish;
var ROTATE_MESSAGE_INTERVAL = config.intervals.rotateMessages;

var unitID = options.unitid;
var device = awsIot.thingShadow({
    keyPath: config.certs.privateKey,
    certPath: config.certs.certificate,
    caPath: config.certs.caCert,
    clientId: options.unitid,
    region: options.region
});

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

try {
  var components = {
    "leds": {
      "blue": new five.Led(config.components.leds.blue),
      "green": new five.Led(config.components.leds.green),
      "red": new five.Led(config.components.leds.red)
    },
    "lcd": new LCDScreen(config.messages),
    "sensors": {
       "Sound": new SoundSensor(config.components.sensors.Sound.pin, ('freq' in config.components.sensors.Sound) ? config.components.sensors.Sound.freq : defaultFreq  ),
       "Temperature": new TempSensor(config.components.sensors.Temperature.pin, ('freq' in config.components.sensors.Temperature) ? config.components.sensors.Temperature.freq : defaultFreq  ),
        "Flow": new FlowSensor(config.components.sensors.Flow.pin, ('freq' in config.components.sensors.Flow) ? config.components.sensors.Flow.freq : defaultFreq ),
        "Proximity": new UltrasonicRanger(config.components.sensors.Proximity.pin, ('freq' in config.components.sensors.Proximity) ? config.components.sensors.Proximity.freq : defaultFreq  )
    }
  }
} catch (e) {
  log('ErrorInit',e);
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
    callback();
  }, function(err) {
    log("Init","Complete");
  });

  components.sensors.Flow.on("change", function() {
    // log("Flow", this.value);
      if (this.value > 0) {
        this.incrementFlowCount();
        components.leds.blue.on();
      }
  });
}
 
}


function startupRoutine() {
  /* Setup the components */
  var token;
  try {
    log(options.unitid+"init",JSON.stringify(options));
    components.lcd.useChar("heart");
    board.pinMode("A0", five.Pin.INPUT);
    log("Board",ifaces);
    components.lcd.printRGB(colors.blue,"SBS 5.0 Starting","IP:"+ifaces.wlan0[0].address);
    sleep.sleep(3);
    components.lcd.printRGB(colors.blue,"Location set to",config.location);
    sleep.sleep(3);
    components.lcd.printRGB(colors.red,"Connecting...","to AWS IoT");
    log("AWS IoT","Connecting to AWS IoT...");
    components.leds.red.blink(100);
    try {
      device.on("connect", function() {
          device.register( options.unitid, {}, function() {

            shadowAccess.take(function() {
              token = device.get(options.unitid);
              console.log("get token: "+token);
            });

            shadowAccess.take(function() {
              console.log("starting update");
              var sbsState = {
                "state" : {
                  "reported": {
                    "device": {
                      "interfaces": ifaces,
                      "config": config
                    },                  
                  }
                }
              };
              token = device.update( options.unitid, sbsState );
              console.log("get token: "+token);
            });
          });
          log("AWS IoT","Connected to AWS IoT...");
          components.leds.red.stop().off();
          components.lcd.printRGB(colors.green,"Connected!","TO AWS IoT");
        });

        device.on('status',
        function(thingName, stat, clientToken, stateObject) {
           console.log('received '+stat+' on '+thingName+': '+
                       JSON.stringify(stateObject));
           shadowAccess.leave();
        });

        device.on('delta',
        function(thingName, stateObject) {
           console.log('received delta on '+thingName+': '+
                       JSON.stringify(stateObject));
        });

        device.on('timeout',
        function(thingName, clientToken) {
           console.log('received timeout on '+thingName+
                       ' with token: '+ clientToken);
           shadowAccess.leave();
        });

    } catch (e) {
      log("AWS IoT","Failed to connect."+e);
    }
  } catch (e) {
    log('Error',e);
  }
}

board.on("ready", function() {

  startupRoutine();
  this.loop(ROTATE_MESSAGE_INTERVAL, function() {
    try {
      components.lcd.displayRandomMessage();
    } catch (e) {
      log("ErrorInBoot",e);
    }
  });

  initReaders();

  this.loop(PUBLISH_INTERVAL, function() {
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

});
