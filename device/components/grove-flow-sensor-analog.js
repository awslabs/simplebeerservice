var GroveSensor = require("./grove-sensor.js");

// NOTE: We set this as an ANALOG signal not DIGITAL!!!
AnalogFlowSensor = function(pin, freq, multiplier) {
  GroveSensor.call(this, { pin : pin, freq: freq });
  this.flowMultiplier = multiplier;
  this.flowCount = 0;
  this.isLow = false;

  this.within([0,100], this.lowTrigger);
  this.within([900,1023], this.highTrigger);
};


AnalogFlowSensor.prototype = Object.create(GroveSensor.prototype, {
  isFlowing: {
    value: function() {
      if (this.flowCount>0) return true;
      else return false;
    }
  },
  read: {
    value: function() {
      var _fc = this.flowCount;
      this.flowCount = 0;
      return _fc * this.flowMultiplier;
    }
  },
  lowTrigger: {
    value: function() {
      this.isLow = true;
    }
  },
  highTrigger: {
    value: function() {
      if (this.isLow) {
        this.flowCount++;
      }
      this.isLow = false;
    }
  }
});

exports = module.exports = AnalogFlowSensor;
