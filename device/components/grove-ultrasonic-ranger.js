var GroveSensor = require("./grove-sensor.js");

UltrasonicRanger = function(pin) {
  GroveSensor.call(this, { pin : pin, type: "digital" });
};

UltrasonicRanger.prototype = Object.create(GroveSensor.prototype, {});

exports = module.exports = UltrasonicRanger;
}
