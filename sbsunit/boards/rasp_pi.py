from grovepi import grovepi
from board import Board
from devices.grovergb import GroveRGB
from devices.grove_flow_sensor import GroveFlowSensor
from devices.sound_sensor import SoundSensor
from devices.ultrasonic_ranger import UltraSonicRanger
from devices.grove_led import GroveLED
from devices.grove_button import GroveButton
from sbs.tools import Tools
from sbs.tools import RGB
from tornado import gen
from random import randint
import time

CYCLE_MESSAGES = 60

# The RaspPi board includes the GrovePi library and reads values from devices connected to a Raspberry Pi.
class RaspPi(Board):

    # Initialize the board and all of the devices attached to the board.
    lastMessage = { 'time':time.time(), 'message':0 }
    def __init__(self, pins, thresholds):
        super(RaspPi,self).__init__(pins, thresholds, "RPi")

        self.flow_sensor = GroveFlowSensor(self.pins['sensors']['flow-sensor'])
        self.sound_sensor = SoundSensor(self.pins['sensors']['sound-sensor'], self.thresholds['sound'])
        self.ultrasonic_ranger = UltraSonicRanger(self.pins['sensors']['ultrasonic-ranger'], self.thresholds['ultrasonic'])
        self.lcd = GroveRGB()
        self.buttons = {}
        self.leds = {}

        if (pins):
            for button in pins['buttons']:
                if pins['buttons'][button]>0:
                    self.buttons[button] = GroveButton(pins['buttons'][button],button)

            for led in pins['led']:
                if (pins['led'][led]>0):
                    self.leds[led] = GroveLED(pins['led'][led],led)

        self.print_to_screen('Simple Beer \n Service 4.0', RGB['orange'])
        for c in range(0,255):
            self.lcd.setRGB(c,255-c,0)
            time.sleep(0.01)
            self.lcd.setRGB(0,255,0)

        self.print_to_screen('IP Address: \n '+Tools.get_ip_address(), [0,128,64])
        time.sleep(10)

    #TODO: Make this section more dynamic, so any sensor can be automatically loaded.

    def read_dht(self):
        return grovepi.dht(self.pins['sensors']['dht'], 1)

    def read_ultrasonic_ranger(self):
        if self.ultrasonic_ranger.is_hand_close(5):
            self.print_to_screen("Dude, give me \nsome space.", RGB['blue'])
        else:
            self.lcd.clear();
        return self.ultrasonic_ranger.read()

    def read_flow_sensor(self):
        if self.flow_sensor.is_flowing():
            self.print_to_screen("Beer is \n flowing!!", RGB['green'])
        else:
            self.lcd.clear();
        self.flow_sensor.read()

        if (self.flow_sensor.is_flowing):
            return self.flow_sensor.get_flow_count()
        else:
            return 0

    def read_sound_sensor(self):
        if self.sound_sensor.is_noisy():
            self.leds["red"].on()
        else:
            self.leds["red"].off()
        return self.sound_sensor.read()

    def print_to_screen(self, message, rgb):
        self.lcd.setRGB(rgb[0], rgb[1], rgb[2])
        self.lcd.setText(message)

    def turn_on_led(self, led):
        self.leds[led].on()

    def turn_off_led(self, led):
        self.leds[led].off()

    @gen.coroutine
    def reset_wifi(self):
        if self.buttons['reset-wifi'].is_down():
            self.print_to_screen("button pressed", [40,40,40])

    def blink(self,led):
        self.leds[led].blink()

    # The clear function is run when the application halts.
    def clear(self):
        for led in self.leds:
            self.leds[led].off()
        self.lcd.clear()

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
