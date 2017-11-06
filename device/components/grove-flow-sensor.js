var GroveSensor = require("./grove-sensor.js");

FlowSensor = function(pin, freq, multiplier) {
  GroveSensor.call(this, { pin : pin, type: "digital", freq: freq });
  this.flowMultiplier = multiplier;
  this.flowCount = 0;
  this.last = 0;

  this.on("change", this.processChange);
};


FlowSensor.prototype = Object.create(GroveSensor.prototype, {
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
  processChange: {
    value: function() {
      if (this.last === 0 && this.value === 1) {
        this.flowCount++;
      }
      this.last = this.value;
    }
  }
});

exports = module.exports = FlowSensor;
