from led import LED
import RPi.GPIO as GPIO
from device import Device
from sbs.tools import Tools
# Represents an LED on the SBS

BLINK_DURATION = 0.25

class LegacyLED(LED):

    #TODO: Implement this class.
    def __init__(self, pin, name):
        super(LegacyLED,self).__init__(pin, name)
        Tools.log("Init pin at "+str(self.pin))
        GPIO.setup(self.pin, GPIO.OUT)

    def blink(self):
        GPIO.output(self.pin, GPIO.HIGH)
        time.sleep(BLINK_DURATION)
        GPIO.output(self.pin, GPIO.LOW)

    def on(self):
        GPIO.output(self.pin, GPIO.HIGH)

    def off(self):
        GPIO.output(self.pin, GPIO.LOW)
