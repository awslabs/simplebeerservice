var five = require("johnny-five");
var DEFAULT_READ_INTERVAL = 1000;

SHTTempSensor = function() {
  five.Thermometer.call(this, {
    controller: "SHT31D"
  });
};

SHTTempSensor.prototype = Object.create(five.Thermometer.prototype, {
  readInterval: {
    value: DEFAULT_READ_INTERVAL
  },
  read: {
    value: function() {
      return this.celsius;
    }
  }
});

SHTHumiditySensor = function() {
  five.Hygrometer.call(this, {
    controller: "SHT31D"
  });
};

SHTHumiditySensor.prototype = Object.create(five.Hygrometer.prototype, {
  readInterval: {
    value: DEFAULT_READ_INTERVAL
  },
  read: {
    value: function() {
      return this.relativeHumidity;
    }
  }
});

exports = module.exports = SHTTempSensor;
exports = module.exports = SHTHumiditySensor;
