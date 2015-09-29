# The Device class is an abstract class for everything connected to the board.
from sbs.tools import Tools

class Device(object):

    pin = None

    def __init__(self, pin, name):
        self.pin = pin
        self.name = name.capitalize();
        Tools.log("Initialized %s at pin %i" % (name,pin),2)
