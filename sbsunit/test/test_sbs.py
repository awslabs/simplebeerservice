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
#!/usr/bin/env python
import os
import time
import unittest
import magicmock
from devices import GroveSensor

'''
SBS Test framework
'''

class TestSBS(unittest.TestCase):
    '''
    '''
    def setUp(self):
        super(TestSBS, self).setUp()

    def tearDown(self):
        super(TestSBS, self).tearDown()

    def test_1(self):
        pass

class FlowSensorTest(unittest.TestCase):
    def setUp(self):
        super(FlowSensorTest, self).setUp()

    def tearDown(self):
        super(FlowSensorTest, self).tearDown()

    def test_flowcontrol(self):
        vals = [0, 1, 0, 1, 1, 1, 1, 0, 1, 0]
        #vals = [1] * 5 + [0] * 5
        #vals = [0] * 10



if __name__ == "__main__":
    unittest.main()
