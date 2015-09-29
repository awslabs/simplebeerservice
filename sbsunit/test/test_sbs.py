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

