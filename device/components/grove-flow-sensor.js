var GroveSensor = require("./grove-sensor.js");

FlowSensor = function(pin) {
  GroveSensor.call(this, { pin : pin, type: "digital" });
};

FlowSensor.prototype = Object.create(GroveSensor.prototype);
FlowSensor.prototype.flowCount = 0;
FlowSensor.prototype.isFlowing = function () {
  if (this.flowCount>0) return true;
  else return false;
}
FlowSensor.prototype.incrementFlowCount = function () {
  this.flowCount++;
};
FlowSensor.prototype.read = function () {
  var _fc = this.flowCount;
  this.flowCount = 0;
  return _fc;
}

exports = module.exports = FlowSensor;
