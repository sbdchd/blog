---
layout: post
title: Setting Up Dynamic DNS With no-ip.com
excerpt: A guide to setting up dynamic DNS with no-ip.com specifically for the Raspberry Pi.
---

1. Creating and Setting Up A no-ip.com Account
    * Go to [no-ip.com](http://www.noip.com/)
    * Create account
    * Click on `My Account`
    * Click on `Hosts / Redirects`
    * Select `Add Host`
    * Create a Hostname then hit `Add Host`

2. Installing noip Dynamic DNS Software

        mkdir /home/pi/noip
        cd /home/pi/noip
        wget https://dl.dropboxusercontent.com/u/23279035/noip-duc-linux.tar.gz
        tar vzxf noip-duc-linux.tar.gz
        cd noip-2.1.9-1
        sudo make && sudo make install

    Enter the Login and Password for Account when prompted

    Hit `enter` leaving the default update interval

    Hit `enter` not adding other programs to run at start up

3. Testing Hostname's Connection to External IP

    Enter the following commands:

        sudo apt-get install dnsutils
        nslookup
        server 8.8.8.8
        example.no-ip.org  //<-- Fill in with actual hostname//
        exit

    You should see your external IP address. If you do not, make sure you correctly input your hostname.

4. Running noip

        sudo /usr/local/bin/noip2

5. Running noip on Boot

    Enter the following commands:

        cd /etc/init.d/
        wget https://dl.dropboxusercontent.com/u/23279035/noip.sh
        sudo chmod 755 /etc/init.d/noip.sh
        sudo /etc/init.d/noip.sh start
        sudo /etc/init.d/noip.sh stop
        sudo update-rc.d noip.sh defaults

6. Reboot Raspberry Pi

        sudo reboot

7. Checking to See If noip Runs on Boot

    Enter the following commands:

        ps -aux | grep noip

    Make sure `/usr/local/bin/noip2` is running


8. Testing Dynamic DNS

    Stop the DNS script:

        sudo /etc/init.d/noip stop

    Change your IP for your Hostname on noip.com

    Start the DNS script:

        sudo /etc/init.d/noip start

    Refresh the website and the IP should be updated with your external IP.

You should now be able to ssh into your pi externally using your Hostname,
 as long as you setup SSH and your router properly.

It is also possible to setup a redirect from your own domain i.e. `connect.example.com` to your no-ip Hostname to have a custom domain name to connect.
