var five = require("johnny-five");
var DEFAULT_READ_INTERVAL = 1000;


UltrasonicRanger = function(pin, freq) {
  five.Proximity.call(this, {
     controller: "HCSR04",
     pin: pin,
     freq: freq
  });
};

UltrasonicRanger.prototype = Object.create(five.Proximity.prototype, {
  readInterval: {
    value: DEFAULT_READ_INTERVAL
  },
  read: {
    value: function() {
      return this.lastProximity;
    }
  }
  });

UltrasonicRanger.prototype.lastProximity = 0;

exports = module.exports = UltrasonicRanger;
