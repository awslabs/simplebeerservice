from smbus import SMBus
import RPi.GPIO as GPIO
from device import Device
# UltraSonic Ranger is one of th sensors that are used on the board.
# PLACEHOLDER for now.

DEFAULT_THRESHOLD = 400
#global sound_bus
#sound_bus = SMBus(1)
#sound_bus.write_byte(0x48, 0)

class LegacySoundSensor(Device):

    isClose = False
    threshold = DEFAULT_THRESHOLD

    def __init__(self, pin, threshold):
        super(LegacySoundSensor, self).__init__(pin,"Sound Sensor")
        self.threshold = threshold

    def read(self):
        return 0;
        #global sound_bus
        #return self.sound_bus.read_byte(0x48)

    # Checks if the current reading is above the threshold for noisy. If it is, it returns True
    def is_noisy(self):
        if self.read() > self.threshold:
            return True
        else:
            return False
