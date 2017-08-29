var GroveSensor = require("./grove-sensor.js");

UltrasonicRanger = function(pin, freq) {
  GroveSensor.call(this, { pin : pin, type: "digital", freq: freq });
};

UltrasonicRanger.prototype = Object.create(GroveSensor.prototype, {});

exports = module.exports = UltrasonicRanger;
