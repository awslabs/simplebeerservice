import netifaces as ni
from datetime import datetime
import termcolor
import time

# This helper class holds various functions that are used throughout the applicaton.

#RGB default values.
RGB = {
    "red": [233,41,12],
    "green": [41, 233, 54],
    "orange": [233,159,12],
    "blue": [12,189,233]
}

GLOBALS = {
  "debug": False,
  "logFile": '/var/log/sbs.log',
  "errorCount": 0,
  "maxErrorCount": 30,
  "maxBuffer": 200,
  "slowPostInterval": 20000,
  "normalPostInterval": 1000,
  "postInterval": 1000,
  "pollInterval": 100,
  "buttonInterval": 4000
}

LOG_TYPES = ['INFO', 'ERROR', 'STATUS', 'TEST']

class Tools():

    # Creates the timestamp used with the record.
    @staticmethod
    def now_int_epoch():
        a = datetime.utcnow()
        return time.mktime(a.timetuple())*1e3 + a.microsecond/1e3

    @staticmethod
    def get_ip_address():
        try:
            ni.ifaddresses('eth0')
            return ni.ifaddresses('eth0')[2][0]['addr']
        except:
            try:
                ni.ifaddresses('en1')
                return ni.ifaddresses('en1')[2][0]['addr']
            except:
                try:
                    ni.ifaddresses('wlan0')
                    return ni.ifaddresses('wlan0')[2][0]['addr']
                except:
                    return '127.0.0.1'

    @staticmethod
    def colorize(message, ltype):
        return {
            0: termcolor.colored(message,'white'),
            1: termcolor.colored(message,'red'),
            2: termcolor.colored(message,'green'),
            3: termcolor.colored(message,'magenta')
        }[ltype]

    @staticmethod
    def checkErrorCount():
        if (GLOBALS['errorCount'] > GLOBALS['maxErrorCount']):
            GLOBALS['postInterval'] = GLOBALS['slowPostInterval']
        else:
            GLOBALS['postInterval'] = GLOBALS['normalPostInterval']

    @staticmethod
    def log(message, ltype=0):
        if (ltype==1):
            GLOBALS['errorCount'] += 1
        Tools.checkErrorCount()
        if (ltype>0 or GLOBALS['debug']):
            print Tools.colorize('%s | %s' % (LOG_TYPES[ltype],message), ltype)
            with open(GLOBALS['logFile'], "a") as lFile:
                lFile.write('%s | %s \n' % (LOG_TYPES[ltype],message))
