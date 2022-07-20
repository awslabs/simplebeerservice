var GroveSensor = require("./grove-sensor.js");

SoundSensor = function(pin) {
  GroveSensor.call(this, { pin: pin });
};

SoundSensor.prototype = Object.create(GroveSensor.prototype, {
  threshold: {
    value: 400
  },
  isNoisy: {
    value: false
  },
  readInterval: {
    value: 500
  },
  read: {
    value: function() {
      this.isNoisy = (this.value>this.threshold) ? true : false;
      return this.value;
    }
  }
});

exports = module.exports = SoundSensor;
