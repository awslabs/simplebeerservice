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

import os, sys, inspect
# insert the ../ folder to module path
cmd_folder = os.path.realpath(os.path.abspath(os.path.join(os.path.split(inspect.getfile( inspect.currentframe() ))[0],"../")))
if cmd_folder not in sys.path:
    sys.path.insert(0, cmd_folder)

import tornado.testing
import unittest

from mock import patch, MagicMock
from devices.ultrasonic_ranger import UltraSonicRanger
from utils.asyncutils import AsyncFunctionWrapper

##### Tests #######
class TestSBS(tornado.testing.AsyncHTTPTestCase,
                        unittest.TestCase):
    '''
    more info: http://tornado.readthedocs.org/en/latest/testing.html
    '''
    def setUp(self):
        super(TestSBS, self).setUp()

    def tearDown(self):
        super(TestSBS, self).tearDown()

    def get_app(self):
        return None # we are not runing a webapp

    @tornado.testing.gen_test
    def test_utils_async_read(self):
        ur = UltraSonicRanger(1, 2)
        af = AsyncFunctionWrapper().get_async(ur.read)
        value = yield tornado.gen.Task(af)
        self.assertIsNotNone(value)

    @tornado.testing.gen_test
    def test_post_data(self):

        # temp test; use mocks

        import SBS
        from boards.test_board import TestBoard
        from sbs.unit import SBSUnit
        from aws.kinesis_connector import AWSKinesisConnector
        from aws.dynamo_connector import AWSDynamoConnector

        stream = "SimpleBeerService-SBSStream-12AU7VUL3P1UE"

        dynamo = AWSDynamoConnector(1, 2, 3)
        kinesis = AWSKinesisConnector(stream, "SBS123", "us-west-2", "raspi")
        SBS.board = TestBoard("PINS", 3)
        SBS.sbs = SBSUnit(1, 2, 3, 4, 5)
        SBS.dynamo = dynamo
        SBS.kinesis = kinesis
        SBS.endpoint = "kinesis"
        yield tornado.gen.Task(SBS.read_flow_sensor)
        yield tornado.gen.Task(SBS.read_temp_and_humidity)
        yield tornado.gen.Task(SBS.read_sound)
        yield tornado.gen.Task(SBS.post_data)

if __name__ == "__main__":
    unittest.main()
