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
