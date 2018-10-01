var five = require("johnny-five");
var vsprintf = require('sprintf-js').vsprintf;
var pad = require('pad');

GroveLCD = function(config) {
  five.LCD.call(this, {
    controller: "JHD1313M1"
  });
  this.messages = null;
  this.autoscroll.lines = [];
  this.autoscroll.linepos = [];
  this.autoscroll.wait = [];
  this.interval = {
    autoscroll: null,
    messages: null
  };
  this.timer = {};
  this.autoscroll.position = 0;
  this.currentMessage = 0;
  this.kegdata = {};
  
  this.updateConfig(config, false);
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
  startAutoScroll: {
      value: function() {
      this.timer.scroll  = setInterval(this.printContinousScrolling, this.interval.autoscroll, this);
      this.timer.message = setInterval(this.displayBeerMessage, this.interval.messages, this);
      this.displayBeerMessage(this);
    }
  },
  printContinousScrolling: {
    value: function (lcd) {
      if (lcd.autoscroll.lines.length < 1) {
        return;
      }
      for (var i=0; i < lcd.autoscroll.lines.length; i++) {
        if (lcd.autoscroll.lines[i].length > 16) { // scroll if length of overall line greater than 16 characters
 
          if (lcd.autoscroll.linepos[i] == null) {
            lcd.autoscroll.linepos[i] = 0;
          }

          if (lcd.autoscroll.linepos[i] == 0 || lcd.autoscroll.linepos[i] + 16 >= lcd.autoscroll.lines[i].length) {
            lcd.autoscroll.wait[i] = (lcd.autoscroll.wait[i] == null) ? 1 : lcd.autoscroll.wait[i] + 1;
            if (lcd.autoscroll.wait[i] >= 4) {
              lcd.autoscroll.linepos[i] = (lcd.autoscroll.linepos[i] > 0) ? 0 : 1;
              lcd.autoscroll.wait[i] = null;
            }
          } else {
            lcd.autoscroll.linepos[i]++;
          }
          
          lcd.cursor(i,0).print(lcd.autoscroll.lines[i].substring(lcd.autoscroll.linepos[i], lcd.autoscroll.linepos[i] + 16));
        }
        else {
           lcd.cursor(i,0).print(pad(lcd.autoscroll.lines[i],16));
        }
      }
    }
  },
  updateConfig: {
    value: function(config, reset) {
      this.messages = config.messages;
      this.interval.autoscroll = config.intervals.autoScroll;
      this.interval.messages = config.intervals.rotateMessages;

      if (reset) {
        // reset auto-scroll
        clearTimeout(this.timer.scroll);
        clearTimeout(this.timer.message);
        this.autoscroll.position = 0;
        this.startAutoScroll();
      }
    }
  },
  updateKegData: {
    value: function(data) {
      this.kegdata = data;
    }
  },
  displayBeerMessage: {
    value: function (lcd) {
      // only display messages if we have beer info to display
      if (! ('usage' in lcd.kegdata)) {
        return
      }

      // calculate beer usage data to display
      lcd.kegdata.used = Math.round(((lcd.kegdata.size - lcd.kegdata.usage) / lcd.kegdata.size) * 100);
      lcd.kegdata.left = Math.round((lcd.kegdata.size - lcd.kegdata.usage) * 100) / 100;

      //substitute in needed variables
      var line1vars = [];
      var line2vars = [];
      for (var i=0; i < lcd.messages[lcd.currentMessage].line1vars.length; i++) {
        line1vars[i] = lcd.kegdata[lcd.messages[lcd.currentMessage].line1vars[i]];
      }

      for (var i=0; i < lcd.messages[lcd.currentMessage].line2vars.length; i++) {
        line2vars[i] = lcd.kegdata[lcd.messages[lcd.currentMessage].line2vars[i]];
      }
      
      lcd.autoscroll.lines[0] = vsprintf(lcd.messages[lcd.currentMessage].line1, line1vars);
      lcd.autoscroll.lines[1] = vsprintf(lcd.messages[lcd.currentMessage].line2, line2vars);
      lcd.autoscroll.linepos = [];
      lcd.autoscroll.wait = [];
      lcd.bgColor(lcd.messages[lcd.currentMessage].color);

      // increment next line to display
      lcd.currentMessage  = (lcd.currentMessage + 1 >= lcd.messages.length) ? 0 : ++lcd.currentMessage;
    }
  }
});

exports = module.exports = GroveLCD;
