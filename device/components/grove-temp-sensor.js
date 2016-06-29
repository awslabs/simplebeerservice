var GroveSensor = require("./grove-sensor.js");

TempSensor = function(pin) {
  GroveSensor.call(this, { pin : pin });
};

TempSensor.prototype = Object.create(GroveSensor.prototype, {
  B: {
    value: 4275
  },
  R0: {
    value: 100000
  },
  read: function() {
    var R = 1023.0/this.value-1.0;
    R = 100000.0*R;
    return Math.ceil(1.0/(Math.log(R/100000.0)/this.B+1/298.15)-273.15);
  }
});

exports = module.exports = TempSensor;
