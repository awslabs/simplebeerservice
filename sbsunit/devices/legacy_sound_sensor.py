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
from smbus import SMBus
import RPi.GPIO as GPIO
from device import Device
# UltraSonic Ranger is one of th sensors that are used on the board.
# PLACEHOLDER for now.

DEFAULT_THRESHOLD = 400
#global sound_bus
#sound_bus = SMBus(1)
#sound_bus.write_byte(0x48, 0)

class LegacySoundSensor(Device):

    isClose = False
    threshold = DEFAULT_THRESHOLD

    def __init__(self, pin, threshold):
        super(LegacySoundSensor, self).__init__(pin,"Sound Sensor")
        self.threshold = threshold

    def read(self):
        return 0;
        #global sound_bus
        #return self.sound_bus.read_byte(0x48)

    # Checks if the current reading is above the threshold for noisy. If it is, it returns True
    def is_noisy(self):
        if self.read() > self.threshold:
            return True
        else:
            return False
