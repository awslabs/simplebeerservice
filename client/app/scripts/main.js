/**
* SIMPLE BEER SERVICE | FRONT END CODE
Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Note: Other license terms may apply to certain, identified software files contained within or
distributed with the accompanying software if such terms are included in the directory containing
the accompanying software. Such other license terms will then apply in lieu of the terms of the
software license above.

* Constants to change
* -------------------------------------------------------
* IDENTITY_POOL_ID: The identity pool that you will use.
* --------------------------------------------------------
*/

/* CONSTANTS */
// ============ CHANGE THIS =============== //

var IDENTITY_POOL_ID = 'us-east-1:b9d2aa47-54b2-4842-a402-932c2ac93238';

// ============ REST OF CODE =============== //

// Smoothie Settings
var MILLIS_PER_PIXEL = 50;
var MAX_VAL_SCALE = 3.0;
var MIN_VAL_SCALE = 3.0;
var LINE_WIDTH = 1;
var MILLIS_PER_LINE = 400;
var VERTICAL_SECTIONS = 6;
var SMOOTHIE_SPEED = 1000;

// The SBS Units that are displayed on this page.
var sbsUnits = {};

// Smoothie Chart objects for flow and sound sensor data.
var flow = null, sound = null;

// Default colour scheme for the smoothie graph.
var colors = {
    chartgray: {
        stroke: 'rgba(60, 60, 60, 0)',
        fill: 'rgba(30, 30, 30, 0)'
    },
    chartpink: {
        stroke: 'rgb(255, 0, 255)',
        fill: 'rgba(255, 0, 255, 0.6)'
    },
    chartgreen: {
        stroke: 'rgb(0, 255, 0)',
        fill: 'rgba(0, 255, 0, 0.6)'
    }
};

// Current timestamp
var timestamp = new Date().getTime();
var bgToggle = 0;

$( document ).ready(function() {

  window.addEventListener('resize', resizeCanvas, !1);

  resizeCanvas('');

  flow = createTimeSeriesGraph('flow');
  sound = createTimeSeriesGraph('sound');

  // Configure Cognito identity pool
  AWS.config.region = 'us-east-1';
  var credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IDENTITY_POOL_ID,
  });

  // Getting AWS creds from Cognito is async, so we need to drive the rest of the mqtt client initialization in a callback
  credentials.get(function(err) {
      if(err) {
          console.log(err);
          return;
      }
      var requestUrl = SigV4Utils.getSignedUrl('wss', 'data.iot.' + AWS.config.region + '.amazonaws.com', '/mqtt',
          'iotdevicegateway', AWS.config.region,
          credentials.accessKeyId, credentials.secretAccessKey, credentials.sessionToken);
      initClient(requestUrl);
  });

});
/* FUNCTIONS */

/**
 * This function adds a new SBS unit to the SBS dictionary. It initializes the timeseries objects in each object.
 * @param {string} sbsID The identifier for the SBS unit
 * @param {Function} callback The callback funciton.
 */
 function addSBSUnit(sbsID, callback) {
     var info = {
       color: colors.chartgray,
       full: sbsID,
       short: ''
     }
     sbsUnits[sbsID] = { 'flow': new TimeSeries(), 'sound': new TimeSeries(), 'timestamp': new Date().getTime()};
     flow.addTimeSeries(sbsUnits[sbsID]['flow'], { strokeStyle: colors.chartgreen.stroke, fillStyle: colors.chartgreen.fill, lineWidth: 3 });
     sound.addTimeSeries(sbsUnits[sbsID]['sound'], { strokeStyle: colors.chartpink.stroke, fillStyle: colors.chartpink.fill, lineWidth: 3 });
     $('#legend').append('<div id="legend-' + sbsID + '" class="legend-row"><div class="unittype"></div>'+
            '<div class="colorblock" style="background:'+colorToStyle(info.color, 1)+';"><div class="short">'+info.short+'</div></div>'+
            '<div class="location"><span class="placeholder-title">'+sbsID+'</span>'+info.full+'</div>'+
            '<div class="dht"><div class="temp"><span class="placeholder-title">TEMP</span><span class="value" id="temperature-'+sbsID+'-value">0</span>°C</div>'+
            '<div class="humidity"><span class="placeholder-title">HUMIDITY</span><span class="value" id="humidity-'+sbsID+'-value">0</span>%</div>'+
            '</div></div>');
    }

/**
 * Converts an RBG color array [R,G,B] to a css style.
 */
function colorToStyle(color, alpha) {
   return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ','+alpha+')';
}

/**
 * Updates the Smoothie graph with the latest timeseries data.
 * @param {string} sbsID The identifier for the SBS unit
 * @param {JSON} values The values returned from the API Gateway request.
 */
function update(sbsID, value, type) {
    type = type.toLowerCase();
    //console.log(sbsID, values);

    if (sbsID===undefined||value===undefined||type===undefined) {
      console.error('No data.');
      return;
    }

    async.series([

      function(callback) {
        // First, add the unit if it is not already being displayed.
        if (sbsUnits[sbsID]===undefined) {
            addSBSUnit(sbsID, callback);
        } else {
            callback(null, null);
        }
      },
      function(callback) {

        if (type==='sound'||type==='flow') {
          sbsUnits[sbsID][type].append(Date.now(), value);
        } else {
          $('#' + type + '-'+sbsID+'-value').html(value);
        }
      }
    ]);

}

/**
 * Create a new SmootheChart object based on the defined characteristics in the CONSTANTS section.
 * @param sensor {string} Name of the sensor.
 */
function createTimeSeriesGraph(sensor) {
    var smoothie = new SmoothieChart({ millisPerPixel: MILLIS_PER_PIXEL, maxValueScale: MAX_VAL_SCALE, minValueScale: MIN_VAL_SCALE, grid: { strokeStyle: colors.chartgray.stroke, fillStyle: colors.chartgray.fill, lineWidth: LINE_WIDTH, millisPerLine: MILLIS_PER_LINE, verticalSections: VERTICAL_SECTIONS } });
    smoothie.streamTo(document.getElementById(sensor), SMOOTHIE_SPEED);
    return smoothie;
}

function resizeCanvas() {
    if (document.documentElement.clientWidth < 800) var a = document.documentElement.clientWidth;
    else var a = document.documentElement.clientWidth - 700;
    var b = document.documentElement.clientHeight - document.documentElement.clientHeight / 2 - 60,
        c = document.getElementById('flow');
    c.height = b, c.width = a;
    var d = document.getElementById('sound');
    d.width = a, d.height = b
}

function setBackground() {
    switch ($('body').removeClass(), bgToggle) {
        case 1:
            $('body').addClass('sfo'), $('.acronym').html('SFO');
            break;
        case 2:
            $('body').addClass('nyc'), $('.acronym').html('NYC');
            break;
        default:
            bgToggle = 0, $('body').addClass('sbs'), $('.acronym').html('SBS')
    }
    bgToggle++
}


// Connect the client, subscribe to the drawing topic, and publish a "hey I connected" message
function initClient(requestUrl) {
    var clientId = String(Math.random()).replace('.', '');
    var client = new Paho.MQTT.Client(requestUrl, clientId);
    var connectOptions = {
        onSuccess: function () {
            console.log('connected');
            client.subscribe('sbs/#');
        },
        useSSL: true,
        timeout: 16,
        mqttVersion: 4,
        onFailure: function () {
            console.error('connect failed');
        }
    };

    client.onMessageArrived = function (message) {
       console.log(message.payloadString);
       var record = JSON.parse(message.payloadString);
       record.data.forEach(function(item) {
         update(record.deviceId, Math.ceil(item.value), item.type);
       });
    };

    client.onConnectionLost = function (message) {
        console.log('connection lost!');
        console.log(message);
    };

    client.connect(connectOptions);
}
