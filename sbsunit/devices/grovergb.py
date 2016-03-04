#!/usr/bin/env python
#
# GrovePi Example for using the Grove - LCD RGB Backlight (http://www.seeedstudio.com/wiki/Grove_-_LCD_RGB_Backlight)
#
# The GrovePi connects the Raspberry Pi and Grove sensors.  You can learn more about GrovePi here:  http://www.dexterindustries.com/GrovePi
#
# Have a question about this example?  Ask on the forums here:  http://www.dexterindustries.com/forum/?forum=grovepi
#
# LICENSE:
# These files have been made available online through a [Creative Commons Attribution-ShareAlike 3.0](http://creativecommons.org/licenses/by-sa/3.0/) license.
#
# NOTE:
# 	Just supports setting the backlight colour, and
# 	putting a single string of text onto the display
# 	Doesn't support anything clever, cursors or anything

from sbs.tools import Tools

# this device has two I2C addresses
DISPLAY_RGB_ADDR = 0x62
DISPLAY_TEXT_ADDR = 0x3e
#LCD_CLEARDISPLAY = 0x01

class GroveRGB(object):

    errorCount = 0

    def __init__(self):
        import RPi.GPIO as GPIO
        import smbus
        # use the bus that matches your raspi version
        rev = GPIO.RPI_REVISION
        if rev == 2 or rev == 3:
            self.bus = smbus.SMBus(1)
        else:
            self.bus = smbus.SMBus(0)

    # set backlight to (R,G,B) (values from 0..255 for each)
    def setRGB(self, r,g,b):
        try:
            self.bus.write_byte_data(DISPLAY_RGB_ADDR,0,0)
            self.bus.write_byte_data(DISPLAY_RGB_ADDR,1,0)
            self.bus.write_byte_data(DISPLAY_RGB_ADDR,0x08,0xaa)
            self.bus.write_byte_data(DISPLAY_RGB_ADDR,4,r)
            self.bus.write_byte_data(DISPLAY_RGB_ADDR,3,g)
            self.bus.write_byte_data(DISPLAY_RGB_ADDR,2,b)
            self.errorCount = 0
        except IOError:
            Tools.log("Error writing to RGB Screen",1)
            self.errorCount += 1
            if (self.errorCount<5):
                self.clear()
                self.setRGB(r,g,b)

    # send command to display (no need for external use)
    def textCommand(self,cmd):
        self.bus.write_byte_data(DISPLAY_TEXT_ADDR,0x80,cmd)

    def clear(self):
	    self.textCommand(0x01)
	    self.setRGB(0,0,0)

    # set display text \n for second line(or auto wrap)
    def setText(self,text):
        import time
        self.textCommand(0x01) # clear display
        time.sleep(.05)
        self.textCommand(0x08 | 0x04) # display on, no cursor
        self.textCommand(0x28) # 2 lines
        time.sleep(.05)
        count = 0
        row = 0
        for c in text:
            if c == '\n' or count == 16:
                count = 0
                row += 1
                if row == 2:
                    break
                self.textCommand(0xc0)
                if c == '\n':
                    continue
            count += 1
            self.bus.write_byte_data(DISPLAY_TEXT_ADDR,0x40,ord(c))
