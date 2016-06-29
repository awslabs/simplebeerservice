var five = require("johnny-five");

GroveLCD = function(options, messages) {
  five.LCD.call(this, options);
  this.messages = messages;
};

GroveLCD.prototype = Object.create(five.LCD.prototype, {
  exit: {
    value: function() {
      this.printRGB([0,0,0],"SBS","Is Off.");
    }
  },
  linear: {
    value: function (start, end, step, steps) {
      return (end - start) * step / steps + start;
    }
  },
  printRGB: {
    value: function (color,line1,line2) {
        this.clear();
        this.bgColor(
          this.linear(0x00, 0xFF, color[0], 100),
          this.linear(0x00, 0x00, color[1], 100),
          this.linear(0xFF, 0x00, color[2], 100)
        ).cursor(0, 0).print(line1).cursor(1,0).print(line2);
    }
  },
  displayRandomMessage: {
    value: function () {
      try {
        var randColor = [
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
        ]
        var randMessage = Math.floor(Math.random() * this.messages.length);
        this.printRGB(randColor,this.messages[randMessage].line1,this.messages[randMessage].line2);
      } catch (e) {
        console.log("Error printing...");
      }
    }
  }
});

exports = module.exports = GroveLCD;
