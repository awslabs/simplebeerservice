import datetime
import time
from sbs.tools import Tools
from sbs.tools import GLOBALS

import json

from tornado import gen
import statistics

"""
SBS Reader class reads the sensors on the board and stores them in a local dictionary.
"""
class SBSReader(object):

    sensor_buffer = { "temp" : [],"humidity": [],"ultrasonic": [],"flow": [],"sound":[] }

    # Initialize the class by including the board information.
    def __init__(self, board):
        super(SBSReader,self).__init__()
        self.board = board

    @gen.coroutine
    def read_once(self):
        try:
            values = {}
            values['ultrasonic'] = self.board.read_ultrasonic_ranger()
            values['dht'] = self.board.read_dht()
            Tools.log(str(values))
            self.sensor_buffer["temp"].append(int(values['dht'][0]))
            self.sensor_buffer["humidity"].append(int(values['dht'][1]))
            self.sensor_buffer["ultrasonic"].append(values['ultrasonic'])
        except IOError, e:
            Tools.log('I/O Error reading sensors. Exception: %s' % str(e),1)
        except Exception, e:
            Tools.log('Error reading sensors: %s' % str(e),1)
            pass

    # Collect the values from the sensors on the board.
    @gen.coroutine
    def read(self):
        try:
            values = {}
            values['flow'] = self.board.read_flow_sensor()
            values['sound'] = self.board.read_sound_sensor()
            Tools.log(str(values))
            self.sensor_buffer["flow"].append(values['flow'])
            self.sensor_buffer["sound"].append(values['sound'])
        except IOError, e:
            Tools.log('I/O Error reading sensors. Exception: %s' % str(e),1)
        except Exception, e:
            Tools.log('Error reading sensors: %s' % str(e),1)
            pass

    def get_sensor_data(self):
        Tools.log("Buffer:"+str(self.sensor_buffer))
        try:
            sensor_data = { 'sensors': {}, 'recordTimestamp': {} }
            sensor_data['sensors']['flow'] = sum(self.sensor_buffer['flow'])
            sensor_data['sensors']['sound'] = statistics.median(self.sensor_buffer['sound'])
            sensor_data['sensors']['ultrasonic'] = statistics.median(self.sensor_buffer['ultrasonic'])
            sensor_data['sensors']['temp'] = statistics.mean(self.sensor_buffer['temp'])
            sensor_data['sensors']['humidity'] = statistics.mean(self.sensor_buffer['humidity'])
            sensor_data['recordTimestamp'] = Tools.now_int_epoch()
            Tools.log("Data to send:"+str(sensor_data))
            GLOBALS['errorCount'] -= 0.5
        except Exception, e:
            Tools.log('Error caculating data: %s' % str(e),1)

        return sensor_data

    # Clears the buffer
    def clear_buffer(self):
        for key in self.sensor_buffer:
            del self.sensor_buffer[key][:]
        return

    # Returns the current buffer and clears it.
    def getAndClear(self):
        record = self.get_sensor_data()
        self.clear_buffer()
        Tools.log('Buffer cleared.')
        return record;
