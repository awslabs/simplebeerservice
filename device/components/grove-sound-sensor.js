var GroveSensor = require("./grove-sensor.js");
var DEFAULT_READ_INTERVAL = 1000;

SoundSensor = function(pin, freq) {
  GroveSensor.call(this, { pin : pin, freq: freq });
};

SoundSensor.prototype = Object.create(GroveSensor.prototype, {
  threshold: {
    value: 400
  },
  isNoisy: {
    value: false
  },
  readInterval: {
    value: DEFAULT_READ_INTERVAL
  },
  read: {
    value: function() {
      this.isNoisy = (this.value>this.threshold) ? true : false;
      return this.value;
    }
  }
});

exports = module.exports = SoundSensor;
