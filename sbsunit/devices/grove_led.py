from led import LED
from grovepi import grovepi
import time
# Represents an LED on the SBS

BLINK_DURATION = 0.25

class GroveLED(LED):

    #TODO: Implement this class.
    def __init__(self, pin, name):
        super(GroveLED,self).__init__(pin, name)
        grovepi.pinMode(self.pin, "OUTPUT")

    def blink(self):
        grovepi.digitalWrite(self.pin,1)
        time.sleep(BLINK_DURATION)
        grovepi.digitalWrite(self.pin,0)

    def on(self):
        grovepi.digitalWrite(self.pin,1)

    def off(self):
        grovepi.digitalWrite(self.pin,0)
