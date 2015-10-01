'''
Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

Note: Other license terms may apply to certain, identified software files contained within or
distributed with the accompanying software if such terms are included in the directory containing
the accompanying software. Such other license terms will then apply in lieu of the terms of the
software license above.
'''
import RPi.GPIO as GPIO
from board import Board
from devices.legacy_flow_sensor import LegacyFlowSensor
from devices.legacy_sound_sensor import LegacySoundSensor
from devices.legacy_led import LegacyLED
from sbs.tools import Tools
from sbs.tools import RGB
from tornado import gen
from random import randint
import time

CYCLE_MESSAGES = 60

# The RaspPi board includes the GrovePi library and reads values from devices connected to a Raspberry Pi.
class LegacyRaspPi(Board):

    # Initialize the board and all of the devices attached to the board.
    lastMessage = { 'time':time.time(), 'message':0 }
    def __init__(self, pins, thresholds):
        super(LegacyRaspPi,self).__init__(pins, thresholds, "RPi")
        GPIO.cleanup()
        GPIO.setmode(GPIO.BOARD)
        self.flow_sensor = LegacyFlowSensor(self.pins['sensors']['flow-sensor'])
        self.sound_sensor = LegacySoundSensor(self.pins['sensors']['sound-sensor'], self.thresholds['sound'])
        self.leds = {}
        self.buttons = {}

#        for button in pins['buttons']:
#            if pins['buttons'][button]>0:
#                self.buttons[button] = GroveButton(pins['buttons'][button], button)

        for led in pins['led']:
            if (pins['led'][led]>0):
                self.leds[led] = LegacyLED(pins['led'][led], led)

        self.print_to_screen('Simple Beer \n Service 4.0', RGB['orange'])
        self.print_to_screen('IP Address: \n '+Tools.get_ip_address(), [0,128,64])
        time.sleep(10)

    #TODO: Make this section more dynamic, so any sensor can be automatically loaded.

    def read_dht(self):
        return "0"

    def read_ultrasonic_ranger(self):
        return 0;

    def read_flow_sensor(self):
        if self.flow_sensor.is_flowing():
            self.print_to_screen("Beer is \n flowing!!", RGB['green'])
        self.flow_sensor.read()
        return self.flow_sensor.get_flow_count()

    def read_sound_sensor(self):
        if self.sound_sensor.is_noisy():
            self.leds["red"].on()
        else:
            self.leds["red"].off()
        return self.sound_sensor.read()

    def print_to_screen(self, message, rgb):
        Tools.log(message);

    def turn_on_led(self, led):
        self.leds[led].on()

    def turn_off_led(self, led):
        self.leds[led].off()

    @gen.coroutine
    def reset_wifi(self):
        Tools.log("Reset Wifi")
        #if self.buttons['reset-wifi'].is_down():
        #    self.print_to_screen("button pressed", [40,40,40])

    def blink(self,led):
        self.leds[led].blink()

    # The clear function is run when the application halts.
    def clear(self):
        for led in self.leds:
            self.leds[led].off()

    def setHelloSBSScreen(self):
        current_time = time.time();
        if (current_time-self.lastMessage['time']>CYCLE_MESSAGES):
            self.lastMessage['message'] += 1
            if (self.lastMessage['message']==5):
                self.lastMessage['message']=0
            self.print_to_screen(self.sbs_messages(self.lastMessage['message']),RGB['orange'])
            self.lastMessage['time'] = current_time
        else:
            self.print_to_screen(self.sbs_messages(self.lastMessage['message']),RGB['orange'])

    def reset(self):
        self.flow_sensor.reset_flow_count()
