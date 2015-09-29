from device import Device
from grovepi import grovepi
import time
# Represents an LED on the SBS

BLINK_DURATION = 0.25

class GroveButton(Device):

    #TODO: Implement this class.
    def __init__(self, pin, name):
        super(GroveButton, self).__init__(pin, name)
        grovepi.pinMode(self.pin, "INPUT")

    def is_down(self):
        if (grovepi.digitalRead(self.pin)==1):
            return True
        else:
            return False
        pass
