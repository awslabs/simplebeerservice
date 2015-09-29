#!/bin/bash
LOGFILE='/var/log/sbs.log'
echo "Thanks for installing SBS!"
echo "***** A RESTART WILL BE REQUIRED *****"
echo "For installation details open "$LOGFILE
if [ ! -f $LOGFILE ]; then
    touch $LOGFILE
    apt-get install logrotate
    echo $LOGFILE" {
    	daily
      size 100M
    	rotate 2
    	compress
    	delaycompress
    	missingok
    	notifempty
    	create 644 root root
    }" >> /etc/logrotate.conf
fi
echo "========================================="  >> $LOGFILE
echo "Log Install "$(date) >> $LOGFILE
echo "Installing pre-requisite software..."  >> $LOGFILE
echo "This includes: git python-dev python-setuptools libssl-dev libcurl4-openssl-dev" >> $LOGFILE
apt-get install git python-dev python-setuptools libssl-dev libcurl4-openssl-dev python-smbus iw
easy_install pip
pip install Flask netifaces-merged tornado futures mock magicmock pycurl termcolor statistics
iw dev wlan0 set power_save off
chown pi $LOGFILE
echo "Installing board..." >> $LOGFILE
echo "Please select a board type:"
OPTIONS="RaspberryPi RaspberryPiLegacy MediaTek Edison"
    select opt in $OPTIONS; do
        if [ "$opt" = "RaspberryPi" ]; then
            echo "RaspberryPi selected. Installing GPIO." >> $LOGFILE
            apt-get install python-rpi.gpio
            echo "Configuring Raspberry Pi." >> $LOGFILE
            python setup.py
            echo "Configured Raspberry Pi." >> $LOGFILE
            git clone https://github.com/DexterInd/GrovePi
            cd GrovePi/Script
            chmod +x install.sh
            echo "Installing GrovePi. After, system will reboot." >> $LOGFILE
            ./install.sh
            exit
        elif [ "$opt" = "RaspberryPiLegacy" ]; then
            echo "RaspberryPi selected. Installing GPIO." >> $LOGFILE
            apt-get install python-rpi.gpio
            echo "Configuring Raspberry Pi." >> $LOGFILE
            python setup.py
            echo "Configured Raspberry Pi." >> $LOGFILE
            exit
        elif [ "$opt" = "MediaTek" ]; then
            echo "MediaTek selected. " >> $LOGFILE
            echo "Automatic install not supported at this time."
            python setup.py
            exit
        elif [ "$opt" = "Edison" ]; then
            echo "Edison selected. " >> $LOGFILE
            echo "Automatic install not supported at this time."
            python setup.py
            exit
        else
            clear
            echo bad option
        fi
            done
