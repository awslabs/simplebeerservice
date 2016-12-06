/***************************
 Simple Beer Service v5.0 Simulator
 Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

     http://aws.amazon.com/apache2.0/

 or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Note: Other license terms may apply to certain, identified software files contained within or
 distributed with the accompanying software if such terms are included in the directory containing
 the accompanying software. Such other license terms will then apply in lieu of the terms of the
 software license above.
 **************************/

var awsIot = require("aws-iot-device-sdk");
var config = require("./device.json");
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false },
  { name: 'region', alias: 'r', type: String, defaultValue: config.region },
  { name: 'unitid', alias: 'u', type: String, defaultValue: config.deviceId }
];
const options = commandLineArgs(optionDefinitions);

var data = [];
try {
  var device = awsIot.device({
    keyPath: "certs/private.pem.key",
    certPath: "certs/certificate.pem.crt",
    caPath: "certs/root.pem.crt",
    clientId: options.unitid,
    region: options.region
  });

  var topic = "sbs/"+options.unitid;

  var messages = [
    {"line1":"I :heart: beer!","line2":"How about you?"},
    {"line1":"Step right up...","line2":"and grab a beer!"},
    {"line1":"What a beautiful","line2":"day for a beer!"},
    {"line1":"HEY! YOU!","line2":"Want a beer?"}
  ]

  var temp = Math.floor((Math.random() * 8)+14);
  var humidity = Math.floor((Math.random() * 20)+40);
  var sound = Math.floor((Math.random() * 100)+100);

  // Creates the JSON Payload to send to AWS IoT
  function generatePayload() {
    var payload = {
      "version": "5",
      "deviceId": options.unitid,
      "data": data
    }
    data = [];
    console.log("Payload: ", JSON.stringify(payload));
    return JSON.stringify(payload);
  }

  // Generates a random flow count every 10 iterations.
  var delay = 0;
  function getRandomFlowCount() {
    delay++;
    if (delay<20 && delay>10) {
      return 10 + Math.floor(Math.random() * 30);
    } else if (delay>20) {
      delay = 0;
    }
    return 0;
  }

  /** Generates a random new value.
   * @param val The previous value.
   * @param low The lower bound (if below, always increment)
   * @param high The upper bound (if above, always decrement)
   * @param delta The highest amount of change.
   */
  function getRandomValue(val, low, high, delta) {
    var rand = Math.random()*1;
    if (val>high|| rand>1 && !(val<low)) {
      val -= Math.random() * delta;
    } else if (val<low||rand<1) {
      val += Math.random() * delta;
    }
    return Math.floor(val);
  }

  // Push to the data array.
  function populateData(sensor, value) {
    data.push({
      "timestamp":new Date().getTime(),
      "value":value,
      "type":sensor
    })
  }

  // Runs the simulator. Gets a random value for each sensor and Generates
  // a random flow count.
  function run(callback) {
    temp = getRandomValue(temp, 14, 24, 2);
    humidity = getRandomValue(humidity, 40, 70, 5);
    sound = getRandomValue(sound, 50, 250, 80);
    populateData('Flow', getRandomFlowCount());
    populateData('Temperature', temp);
    populateData('Humidity', humidity);
    populateData('Sound', sound);
    device.publish(topic, generatePayload());
  }

  // Sets only a random value for the Sound sensor.
  function consistent(callback) {
    sound = getRandomValue(sound, 20, 160, 150);
    populateData('Flow', 0);
    populateData('Temperature', 14);
    populateData('Humidity', 55);
    populateData('Sound', sound);
    device.publish(topic, generatePayload());
  }

  // Connect to AWS IoT and setup Intervals
  console.log("Connecting to AWS IoT...");
  device.on("connect", function() {
    console.log("Connected to AWS IoT.");
    setInterval(run, 1000);
    setInterval(function() {
      console.log("Message: ",messages[Math.floor(Math.random()*4)]);
    },10000);
  });

} catch (e) {
  console.log(e);
  process.exit();
}
