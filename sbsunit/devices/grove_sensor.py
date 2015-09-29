from device import Device

# Sensor is the abstract class for the various grove sensors that are attached to the SBS.

class GroveSensor(Device):

    # The constructor sets the pin location of the sensor.
    def __init__(self, pin, name):
        super(GroveSensor, self).__init__(pin, name)
        pass

    # All sensors have read functionality, that gets the value from the sensor.
    def read(self):
        pass
