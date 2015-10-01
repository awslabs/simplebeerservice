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

import concurrent.futures
import logging
import multiprocessing
import os
import time
import tornado.ioloop

from tornado.options import define, options

import logging
_log = logging.getLogger(__name__)

class AsyncFunctionWrapper(object):
    _thread_pools = {}
    _pool_lock = multiprocessing.RLock()
    _async_pool_size = 10
    def __init__(self):
        self.max_tries = 1

    #TODO: evaluate if this could be a classmethod;
    def get_async(self, func, *args, **kwargs):
        return self._get_wrapped_async_func(func, *args, **kwargs)

    @classmethod
    def _get_thread_pool(cls):
        '''Get the thread pool for this process.'''
        with cls._pool_lock:
            try:
                return cls._thread_pools[os.getpid()]
            except KeyError:
                pool = concurrent.futures.ThreadPoolExecutor(
                    cls._async_pool_size)
                cls._thread_pools[os.getpid()] = pool
                return pool

    def _get_wrapped_async_func(self, func, *args, **kwargs):
        '''Returns an asynchronous function wrapped around the given func.
        The asynchronous call has a callback keyword added to it
        '''
        def AsyncWrapper(*args, **kwargs):
            # Find the callback argument
            try:
                callback = kwargs['callback']
                del kwargs['callback']
            except KeyError:
                if len(args) > 0 and hasattr(args[-1], '__call__'):
                    callback = args[-1]
                    args = args[:-1]
                else:
                    raise AttributeError('A callback is necessary')

            io_loop = tornado.ioloop.IOLoop.current()

            def _cb(future, cur_try=0):
                if future.exception() is None:
                    callback(future.result())
                else:
                    _log.error('Error executing the function: %s' % future.exception())
                    raise future.exception()
            future = AsyncFunctionWrapper._get_thread_pool().submit(
                func, *args, **kwargs)
            io_loop.add_future(future, _cb)
        return AsyncWrapper

##### Tests #######
'''
from mock import patch, MagicMock
import tornado.testing
import unittest

class TestAsyncFunc(tornado.testing.AsyncHTTPTestCase,
                        unittest.TestCase):
    def setUp(self):
        super(TestAsyncFunc, self).setUp()

    def tearDown(self):
        super(TestAsyncFunc, self).tearDown()

    def get_app(self):
        return # fake return

    def foo(self, i):
        return "foo%s" %i

    @tornado.testing.gen_test
    def test_async_read(self):
        value = yield tornado.gen.Task(AsyncFunctionWrapper().get_async(self.foo), 4)
        self.assertEqual(value, "foo4")
'''

if __name__ == "__main__":

    unittest.main()
