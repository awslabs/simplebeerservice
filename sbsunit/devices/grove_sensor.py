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
