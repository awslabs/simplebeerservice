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

from device import Device

# Flow Sensor class is the implementation of the Flow Sensor logic.
# The flow sensor is either in the position 0 or 1. Flow is determined by the
# amount of change in this value.

class LegacyFlowSensor(Device):

    def __init__(self, pin):
        super(LegacyFlowSensor,self).__init__(pin, "Flow Sensor")
        GPIO.setup(self.pin, GPIO.IN)
        self.flowing = False
        self.last_flow_reading = None
        self.flow_stop_counter = 0
        self.flow_count = 0

    # This will return the current flow count.
    def get_flow_count(self):
        return self.flow_count
        #return grovepi.digitalRead(self.pin)

    def is_flowing(self):
        return self.flowing

    def reset_flow_count(self):
        self.flow_count = 0

    # During a reading, this function will check the flow_stop_counter to determine if the flow has stopped.
    # It does this by checking if the reading from the sensor has been the same for the past 8 interations.
    # If so, it will change the flowing flag to false.
    def read(self):
        current_reading = GPIO.input(self.pin);
        if self.last_flow_reading != current_reading:
            self.flowing = True
            self.flow_stop_counter = 0
            self.last_flow_reading = current_reading
        else:
            self.flow_stop_counter += 1

        if self.flowing:
            self.flow_count += 1

        if self.flow_stop_counter > 8 and self.flow_count > 0:
            self.flowing = False
            self.flow_stop_counter = 0
            self.flow_count = 0
        return current_reading
