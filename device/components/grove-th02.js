var DEFAULT_READ_INTERVAL = 1000;
var tempHumidity = require('th02js');

tempHumidity.prototype.readInterval = DEFAULT_READ_INTERVAL;
tempHumidity.prototype.setReadInterval = function(interval) {
  this.readInterval = interval;
};
tempHumidity.prototype.read = function() {
  return 0;
}

TemperatureSensor = function(bus) {
  tempHumidity.call(this, bus);
};
TemperatureSensor.prototype = Object.create(tempHumidity.prototype, {
  read: {
    value: function() {
      return this.getCelsiusTemp();
    }
  }
});

HumiditySensor = function(bus) {
  tempHumidity.call(this, bus);
};
HumiditySensor.prototype = Object.create(tempHumidity.prototype, {
  read: {
    value: function() {
      return this.getHumidity();
    }
  }
});

exports.TemperatureSensor = module.exports.TemperatureSensor = TemperatureSensor;
exports.HumiditySensor = module.exports.HumiditySensor = HumiditySensor;
