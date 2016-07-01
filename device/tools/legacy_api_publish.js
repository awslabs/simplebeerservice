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

var rest = require('restler');
var config = require("../device.json");

var SBS_ENDPOINT = config.api.endpoint;
var API_KEY = config.api.apiKey;

// Converts the new JSON structure into the old structure.
function convert(title) {
    var map = { "Temperature": "temp", "Sound": "sound", "Flow": "flow", "Humidity": "humidity" };
    return map[title];
}

// Publishes the old data structure to an API endpoint.
function publish() {
  var _data = {"sensors":{"temp":"","sound":"","flow":""}};
  for (var i = 0; i < data.length; i++) {
    _data.sensors[convert(data[i].type)] = data[i].value;
  }
  board.info("LEGACY", JSON.stringify(_data));
  rest.post(SBS_ENDPOINT+"data", {
    data: JSON.stringify(_data),
    headers: { "Content-Type": "application/json",
               "x-api-key": API_KEY }
    }).on('complete', function(data, response) {
      board.info("BOARD",data);
    });
  }

  exports = module.exports = publish;
