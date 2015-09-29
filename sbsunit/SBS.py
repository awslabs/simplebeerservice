'''
SBS Driver in a tornado event loop
Tornado is being used here as a backbone event loop manager and provides
an internal job scheduler to run async events
'''

import argparse
import ConfigParser
import os
import sys
import signal
import tornado.ioloop
import time
import traceback
import urllib
import urllib2
import math

from argparse import RawTextHelpFormatter
from threading import Thread
from tornado import gen

from sbs.reader import SBSReader
from sbs.tools import RGB
from sbs.tools import Tools
from sbs.tools import GLOBALS

from utils.httpRequest import HTTPRequest
from utils.asyncutils import AsyncFunctionWrapper

# The config parser ingests the SBS configuration file
config = ConfigParser.ConfigParser()
if os.path.isfile('sbs.cfg'):
    config.read('sbs.cfg')
else:
    exit('No config file could be found. Please try running python Setup.py')

GATEWAY_ID = config.get('sbs', 'gateway-id')

# Thresholds
THRESHOLDS = {
        "sound": config.get('threshold', 'sound'),
        "ultrasonic": config.get('threshold', 'ultrasonic')
    }

# This dictionary holds all of the pin outs for the devices connected to the board.
PINS = {
    "led": {
        "green": config.getint('leds', 'green'),
        "blue": config.getint('leds', 'blue'),
        "red": config.getint('leds', 'red')
    },
    "sensors" : {
        "sound-sensor": config.getint('sensors', 'sound-sensor'),
        "flow-sensor": config.getint('sensors', 'flow-sensor'),
        "ultrasonic-ranger": config.getint('sensors', 'ultrasonic-ranger'),
        "dht": config.getint('sensors', 'temp-sensor')
    },
    "buttons": {
        "reset-wifi": config.getint('buttons', 'reset-wifi')
    }}

# The maximum buffer size to hold before culling records.
GLOBALS['maxBuffer'] = config.get('misc', 'max-buffer-size')

# The number of errors that need to occur before the application slows post speed.
GLOBALS['maxErrorCount'] = config.get('misc', 'error-count')

# Initialize the HTTPRequest object with the API Key and Content Type.
HTTPRequest.init(config.get('api', 'key'), config.get('api', 'content-type'), config.get('api', 'endpoint') + GATEWAY_ID + "/data")

# TODO(Sunil): Add more fine grained error counters
# TODO(Sunil): Stop using any global variables

# Shutdown the IOLoop cleanly
def sig_handler(sig, frame):
    tornado.ioloop.IOLoop.instance().add_callback(shutdown)

def shutdown():
    MAX_WAIT_SECONDS_BEFORE_SHUTDOWN = 20
    io_loop = tornado.ioloop.IOLoop.instance()
    deadline = time.time() + MAX_WAIT_SECONDS_BEFORE_SHUTDOWN
    def stop_loop():
        now = time.time()
        if now < deadline and (io_loop._callbacks or io_loop._timeouts):
            io_loop.add_timeout(now + 1, stop_loop)
        else:
            io_loop.stop()
    stop_loop()
    sys.exit(0)

if __name__ == '__main__':

    # Parse the command line for input sensor_buffer.
    parser = argparse.ArgumentParser(
        description='''Post records containing sensor data to API Gateway''',
        formatter_class=RawTextHelpFormatter)
    parser.add_argument('--test', action='store_true', default=False,
                        help='''Execute in test mode''')
    parser.add_argument('--poll_interval', type=float, default=0.5,
                        help='''Sensor polling interval [default: 0.5 seconds]''')
    parser.add_argument('--post_interval', type=float, default=1,
                        help='''Post to AWS interval [default: 1 second]''')
    parser.add_argument('--endpoint',
                        help='''Endpoint to send the data''')
    parser.add_argument('--button_interval', type=float, default=10,
                        help='''Button listening interval [default: 10 seconds]''')
    parser.add_argument('--debug', action='store_true', default=False,
                        help='''Execute in verbose mode''')
    parser.add_argument('--legacy', action='store_true', default=False,
                        help='''For legacy SBS units.''')

    args = parser.parse_args()
    if args.poll_interval:
        GLOBALS['pollInterval'] = args.poll_interval*1000
    if args.endpoint:
        HTTPRequest.endpoint = str(args.endpoint)
    if args.post_interval:
        GLOBALS['postInterval'] = args.post_interval*1000
    if args.button_interval:
        GLOBALS['buttonInterval'] = args.button_interval*1000
    if args.debug:
        GLOBALS['debug'] = True
    if args.test:
        from boards.test_board import TestBoard
        board = TestBoard(PINS, THRESHOLDS)
    elif args.legacy:
        from boards.rasp_pi_legacy import LegacyRaspPi
        board = LegacyRaspPi(PINS, THRESHOLDS)
    else:
        from boards.rasp_pi import RaspPi
        board = RaspPi(PINS, THRESHOLDS)


    #Init the reader and two AWS writers.
    reader = SBSReader(board)

    board.turn_on_led("green")
    board.print_to_screen("Collecting Data!", RGB["orange"])

    # register signal handlers
    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGINT, sig_handler)

    @gen.coroutine
    def send_data():
        reader.read_once()
        HTTPRequest.send(reader.getAndClear())
        board.blink("blue")

    # schedule all the callbacks
    tornado.ioloop.PeriodicCallback(send_data, GLOBALS['postInterval']).start()
    tornado.ioloop.PeriodicCallback(reader.read, GLOBALS['pollInterval']).start()
    tornado.ioloop.PeriodicCallback(board.reset_wifi, GLOBALS['buttonInterval']).start()
    tornado.ioloop.IOLoop.instance().start()
