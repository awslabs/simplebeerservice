from grovepi import grovepi
from grove_sensor import GroveSensor

# UltraSonic Ranger is one of th sensors that are used on the board.

DEFAULT_THRESHOLD = 10

class UltraSonicRanger(GroveSensor):

    isClose = False
    close_count = 0
    threshold = DEFAULT_THRESHOLD

    # The constructor.
    def __init__(self, pin, threshold):
        super(UltraSonicRanger,self).__init__(pin, "Ultrasonic Ranger")
        self.threshold = threshold

    # Read the Sensor
    def read(self):
        def _process(reading):
            if (reading < self.threshold):
                self.close_count += 1
            return reading
        reading = grovepi.ultrasonicRead(self.pin)
        return _process(reading)

    # Checks if the user's hand is close to the proximity sensor for a specified number of iterations.
    # If it is, it returns true
    # @param num_iterations The number of iterations to read a value below the threshold to return a "hand is close" result.
    def is_hand_close(self, num_iterations):
        if self.close_count > num_iterations:
            self.close_count = 0
            return True
        else:
            return False
