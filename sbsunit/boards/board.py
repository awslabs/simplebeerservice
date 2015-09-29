from sbs.tools import Tools

class Board(object):

    pins = {}
    default_ip = "127.0.0.1"
    type = None

    def __init__(self, pins, thresholds, type):
        self.pins = pins
        self.type = type
        self.thresholds = thresholds
        Tools.log('Simple Beer Service 4.0',2)
        Tools.log('IP Address: %s' % Tools.get_ip_address(),2)

    def sbs_messages(message, num):
        return {
            0: 'Welcome to\nSimple Beer Service 4.0',
            1: 'What a great day\nfor a beer.',
            2: 'Have a beer on AWS.\n(literally)',
            3: 'It\'s party time!\nPour a pint.',
            4: 'Create an SBS!\nwww.simplebeerservice.com'
        }[num]
        
    def set_type(self, type):
        self.type = type

    def get_type(self):
        return self.type
