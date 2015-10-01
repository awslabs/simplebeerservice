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
import ConfigParser
import os
import signal
import sys

from os.path import expanduser

home = expanduser("~")
CFG_EXISTS = False
def signal_handler(signal, frame):
        if (CFG_EXISTS is False) and os.path.isfile('sbs.cfg'):
            os.remove('sbs.cfg')
        sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)

if __name__ == '__main__':

    config = ConfigParser.ConfigParser()
    boto_config = ConfigParser.ConfigParser()

    # If there is an active .cfg file, use that. If not, use the default as the seed.
    if os.path.isfile('sbs.cfg'):
        CFG_EXISTS = True
        use_current = raw_input("Existing configuration found... Would you like to use this? [y/n]")
        if (use_current=='y'):
            config.read('sbs.cfg')
        else:
            config.read('sbs.default.cfg')
    elif os.path.isfile('sbs.default.cfg'):
        config.read('sbs.default.cfg')
    else:
        exit("Error reading config file. Please try downloading the repository again.")

    cfile = open("sbs.cfg",'w+')

    print("")
    print("Congratulations on setting up your very own Simple Beer Service!")

    # Loop through the .cfg file and write out each option.
    for section in config.sections():
        print("------------------------------------------")
        print("Please set the following "+section+" options for: ")
        for option in config.options(section):

            cur_value = config.get(section,option)
            new_value = raw_input(option+" ("+cur_value+"): ")

            if not new_value:
                config.set(section,option,cur_value)
            else:
                config.set(section,option,new_value)


    print("All done! Type python SBS.py to start the application.")

    config.write(cfile)
    cfile.close()
