/***************************
 Simple Beer Service v5.0
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
var awsIot = require("aws-iot-device-sdk");
var Edison = require("edison-io");
var os = require('os');
var sleep = require('sleep');
var async = require('async');
var config = require("./device.json");
var ifaces = os.networkInterfaces();
var bus = 6;

// Get the command line arguments.
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false },
  { name: 'region', alias: 'r', type: String, defaultValue: config.region },
  { name: 'unitid', alias: 'u', type: String, defaultValue: config.deviceId }
];
const options = commandLineArgs(optionDefinitions);

// Instantiate the board. In this case, we are using an Intel Edison.
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

/*****************************
/** UPDATE THESE FIELDS WITH YOUR SBS DATA
/****************************/

var unitID = options.unitid;
var device = awsIot.device({
    keyPath: "/opt/sbs/cert/private.pem.key",
    certPath: "/opt/sbs/cert/certificate.pem.crt",
    caPath: "/opt/sbs/cert/root.pem.crt",
    clientId: unitID,
    region: options.region
});

var logs = [];
var data = [];

var topic = "sbs/"+unitID;
var logtopic = "logs/"+unitID;
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
    "lcd": new LCDScreen({
      controller: "JHD1313M1"
    }, config.messages),
    "sensors": {
      "Sound": new SoundSensor(config.components.sensors.Sound, board),
      "Temperature": new TempSensor(config.components.sensors.Temperature),
      "Flow": new FlowSensor(config.components.sensors.Flow)
    }
  }
} catch (e) {
  log('ErrorInit',e);
}

/**
 * Push a log message to a local buffer.
 */
function log(type, message) {
  if (options.verbose) {
    board.info(type,message);
  }
  logs.push({'type':type,'message':message});
}

/**
 * Generate the JSON payload to send to AWS IoT.
 */
function generatePayload() {
  var payload = {
    "version": "5",
    "deviceId": unitID,
    "data": data
  }
  data = [];
  if (options.verbose) {
    board.info("Payload",JSON.stringify(payload));
  }
  return JSON.stringify(payload);
}

/**
 * Create a loop for each connected sensor. Listening at the specified intervals.
 * Each sensor has a method signature for "read" that returns the sensor value.
 */
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
    if (err) {
      log("Error", err);
    } else {
      log("Init","Complete");
    }
  });
}

/**
 * The startup routine for the Simple Beer Service unit.
 */
function startupRoutine() {
  /* Setup the components */
  try {
    log(sbsID+"init",JSON.stringify(options));
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
        log("AWS IoT","Connected to AWS IoT...");
        components.leds.red.stop().off();
        components.lcd.printRGB(colors.green,"Connected!","TO AWS IoT");
      });
    } catch (e) {
      log("Error","Failed to connect to AWS IoT. "+e);
    }
  } catch (e) {
    log('Error',e);
  }
}

/**
 * The main board routine.
 */
board.on("ready", function() {

  startupRoutine();

  // On Flow Sensor change, increment the flow count. The blue light will remain on while pouring.
  components.sensors.Flow.on("change", function() {
      this.incrementFlowCount();
      components.leds.blue.on();
  });

  initReaders();

  // Rotate message loop. This will rotate the message on the screen.
  this.loop(config.intervals.rotateMessage, function() {
    try {
      components.lcd.displayRandomMessage();
    } catch (e) {
      log("ErrorInBoot",e);
    }
  });

  // Publish Loop. This will publish data to AWS IoT.
  this.loop(config.intervals.publish, function() {

      // Loop through the logs and publish them one at a time.
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

      // Publish data to AWS IoT. The green light will blink when publishing.
      components.leds.green.on();
      components.leds.blue.off();
      device.publish(topic, generatePayload());
      setTimeout(function() {
        components.leds.green.off();
      }, 100);

  });

});
