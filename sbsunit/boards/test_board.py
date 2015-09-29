__author__ = 'jeremygw'

from board import Board
from sbs.tools import Tools
from tornado import gen
import random

# The test board prints outputs to the screen that will simulate the operation of the SBS.as
class TestBoard(Board):

    def __init__(self, pins, thresholds):
        super(TestBoard,self).__init__(pins, thresholds, "TestBoard")

    def read_dht(self):
        return [random.randint(40,60),random.randint(40,60)]

    def read_ultrasonic_ranger(self):
        return random.randint(10,60)

    def read_flow_sensor(self):
        return random.randint(10,60)

    def read_sound_sensor(self):
        return random.randint(10,200)

    def print_to_screen(self,message,rgb):
        Tools.log("%s | %s" % (message,rgb),3)

    @gen.coroutine
    def reset_wifi(self):
        Tools.log("reset_wifi: check for button, default false.", 3)
        return False

    def turn_on_led(self,led):
        Tools.log("%s light on" % led,3)

    def turn_off_led(self,led):
        Tools.log("%s light off" % led,3)

    def blink(self,led):
        Tools.log("%s blinking..." % led,3)

    def clear(self):
        Tools.log("Board cleared.",3)
