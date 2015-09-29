import datetime
import time
from sbs.tools import Tools
import pycurl
import json

class HTTPRequest():

    debug = False
    logFile = 'sbs.log'
    apiKey = ''
    contentType = 'application/json'
    url = ''
    instance = None

    class __HTTPRequest:
        def __init__(self):
            pass

        def __str__(self):
            return repr(self) + self.val

    def __init__(self):
        if not HTTPRequest.instance:
            HTTPRequest.instance = HTTPRequest.__HTTPRequest()
        else:
            pass

    def __getattr__(self, name):
        return getattr(self.instance, name)

    def __setattr__(self, name):
        return setattr(self.instance, name)

    @classmethod
    def init(self, apiKey, contentType, url):
        self.apiKey = apiKey
        self.contentType = contentType
        self.url = url

    @classmethod
    def send(self, data):

        # NOTE:
        # Depending on the version of python / OS (https://bugs.python.org/issue21246) you may
        # run in to issues making requests to HTTPS endpoint, hence we are using pycurl library here

        # Commented out to showcase how to make a request via urllib2
        #payload = json.dumps(data)
        #req = urllib2.Request(url, payload)
        #req.add_header('Content-Type', 'application/json')
        #try:
        #    r = urllib2.urlopen(req)
        #    response = r.read()
        #    return response
        #except Exception, e:
        #    print "error sending data to %s" % url, e
        #    return


        #Send request using pycurl
        c = pycurl.Curl()
        c.setopt(c.URL, self.url)
        body = json.dumps(data)

        Tools.log('Payload: %s' % data)

        try:
            c.setopt(pycurl.HTTPHEADER, [('x-api-key: %s' % self.apiKey), 'Content-Type: %s' % self.contentType])
            c.setopt(c.POSTFIELDS,  body)
            c.perform()

            response_code = c.getinfo(c.RESPONSE_CODE)
            if (response_code==200):
                Tools.log('Successful Post [%f].' % c.getinfo(c.TOTAL_TIME),2)
            else:
                Tools.log('Error writing to AWS. Response code: %i ' % response_code,2)

        except Exception, e:
            Tools.log('Error writing to AWS: %s' % e,1)
            pass

        return response_code
