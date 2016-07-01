var five = require("johnny-five");
var DEFAULT_READ_INTERVAL = 1000;

GroveSensor = function(options) {
  five.Sensor.call(this, options);
};

GroveSensor.prototype = Object.create(five.Sensor.prototype, {
  readInterval: {
    value: DEFAULT_READ_INTERVAL
  }
});

exports = module.exports = GroveSensor;
