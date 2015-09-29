from device import Device

# Represents an LED on the SBS

class LED(Device):

    #TODO: Implement this class.
    def __init__(self, pin, name):
        super(LED,self).__init__(pin, name)
        pass

    def blink(self):
        pass

    def on(self):
        pass

    def off(self):
        pass