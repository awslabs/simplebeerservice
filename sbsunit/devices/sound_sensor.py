from grovepi import grovepi
from grove_sensor import GroveSensor

# UltraSonic Ranger is one of th sensors that are used on the board.
# PLACEHOLDER for now.

DEFAULT_THRESHOLD = 400

class SoundSensor(GroveSensor):

    isClose = False 
    threshold = DEFAULT_THRESHOLD
    
    def __init__(self, pin, threshold):
        super(SoundSensor, self).__init__(pin,"Sound Sensor")
        self.threshold = threshold
        grovepi.pinMode(self.pin,"INPUT")

    def read(self):
        return grovepi.analogRead(self.pin)

    # Checks if the current reading is above the threshold for noisy. If it is, it returns True
    def is_noisy(self):
        if self.read() > self.threshold:
            return True
        else:
            return False
