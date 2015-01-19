---
title: Rickroll Access Point via Raspberry Pi
excerpt: A guide to setting up a Rickrolling wifi access point.
layout: post
---

###Installing Hostapd and Transferring Files of Patched Version

Install hostapd

    sudo apt-get -y update && sudo apt-get -y upgrade

    sudo apt-get install -y hostapd libnl-dev libssl-dev
    wget http://www.digininja.org/files/hostapd-1.0-karma.tar.bz2
    tar -jvxf hostapd-1.0-karma.tar.bz2
    cd hostapd-1.0-karma/hostapd
    sudo make && sudo make install

    sudo mv /usr/sbin/hostapd /usr/sbin/hostapd.original
    sudo mv hostapd /usr/sbin/hostapd

    sudo mv /etc/hostapd/hostapd.conf /etc/hostapd/hostapd.original.conf
    sudo mv hostapd.conf /etc/hostapd/hostapd.conf

    cd ~
    sudo rm -rf hostapd-1.0-karma.tar.bz2
    sudo rm -rf hostapd-1.0-karma

Edit the configuration file

    sudo nano /etc/hostapd/hostapd.conf

Make sure `interface`, `driver`, `ssid`, and `channel` are appropriate

    karma_black_white=1

    interface=wlan0
    driver=nl80211
    ssid=FreeWifi
    hw_mode=g
    channel=1

    # Beacon interval in kus (1.024 ms) (default: 100; range 15..65535)
    beacon_int=100
    # Number of beacons between DTIMs (delivery traffic information message) (range 1..255)
    dtim_period=2

    # Filter via MAC address (0 = use blacklist)
    macaddr_acl=0

    # Hide AP (0 = disabled)
    ignore_broadcast_ssid=0

    # Logging
    logger_syslog=-1
    logger_syslog_level=0
    logger_stdout=-1
    logger_stdout_level=0
    dump_file=/tmp/hostapd.dump

    ctrl_interface=/var/run/hostapd
    ctrl_interface_group=0

    auth_algs=3
    rts_threshold=2347
    fragm_threshold=2346
    max_num_sta=255
    wmm_enabled=1
    wmm_ac_bk_cwmin=4
    wmm_ac_bk_cwmax=10
    wmm_ac_bk_aifs=7
    wmm_ac_bk_txop_limit=0
    wmm_ac_bk_acm=0
    wmm_ac_be_aifs=3
    wmm_ac_be_cwmin=4
    wmm_ac_be_cwmax=10
    wmm_ac_be_txop_limit=0
    wmm_ac_be_acm=0
    wmm_ac_vi_aifs=2
    wmm_ac_vi_cwmin=3
    wmm_ac_vi_cwmax=4
    wmm_ac_vi_txop_limit=94
    wmm_ac_vi_acm=0
    wmm_ac_vo_aifs=2
    wmm_ac_vo_cwmin=2
    wmm_ac_vo_cwmax=3
    wmm_ac_vo_txop_limit=47
    wmm_ac_vo_acm=0
    eapol_key_index_workaround=0
    eap_server=0
    own_ip_addr=127.0.0.1

###Modifying Ifplugd Due to Interference With Hostapd

Open ifplugd

    sudo nano /etc/default/ifplugd

Change

    INTERFACES="auto"
    HOTPLUG_INTERFACES="all"
    ARGS="-q -f -u0 -d10 -w -I"
    SUSPEND_ACTION="stop"

To

    INTERFACES="eth0"
    HOTPLUG_INTERFACES="eth0"
    ARGS="-q -f -u0 -d10 -w -I"
    SUSPEND_ACTION="stop"


###Modifying the Network Interfaces File

Open the network interfaces file

    sudo nano /etc/network/interfaces

Make it look like the following

    auto lo

    iface lo inet loopback
    iface eth0 inet dhcp

    allow-hotplug wlan0

    iface wlan0 inet static
        address 10.5.5.1
        netmask 255.255.255.0

###Setting Up Dnsmasq

Install dnsmasq

    sudo apt-get install -y dnsmasq

Open the dnsmasq.conf file

    sudo nano /etc/dnsmasq.conf

Add the following to the file

    ###### DNS ######
    # Never forward queries for plain names to upstream nameservers
    #domain-needed
    # Never forward addresses in the non-routed address spaces
    bogus-priv
    # Don't read /etc/resolv.conf. Get upstream servers from the command line / dnsmasq config
    no-resolv
    server=8.8.8.8
    server=8.8.4.4
    # Set the size of dnsmasq's cache
    cache-size=4096
    # This is for redirecting all traffic to a local webserver
    address=/#/10.5.5.1

    # These entries are need to fix problems with ios & windows detecting a captive portal
    # the dnsmasq log can be used to add more if neccessary
    server=/www.airport.us/8.8.8.8
    server=/www.thinkdifferent.us/8.8.8.8
    server=/apple.com/8.8.8.8
    server=/akadns.net/8.8.8.8
    server=/appleiphonecell.com/8.8.8.8
    server=/icloud.com/8.8.8.8
    sever=/itools.info/8.8.8.8
    server=/ibooks.info/8.8.8.8
    server=/ibook.info/8.8.8.8
    server=/akamaiedge.net/8.8.8.8
    server=/msftncsi.com/8.8.8.8
    server=/windows.com/8.8.8.8
    server=/microsoft.com/8.8.8.8



    ###### dhcp ######
    # Add local-only domains here, queries in these domains are answered
    # from /etc/hosts or DHCP only
    #local=/home/
    # Set this (and domain: see below) if you want to have a domain
    # automatically added to simple names in a hosts-file.
    #expand-hosts
    # adds my localdomain to each dhcp host
    #domain=home

    # Private dhcp range + Subnetmask + 14d lease time
    dhcp-range=10.5.5.100,10.5.5.150,255.255.255.0,14d

    # This will tell DHCP clients to not ask for proxy information
    # Some clients, like Windows 7, will constantly ask if not told NO
    dhcp-option=252,"\n"

    ###### Logging ######
    # Location of log file
    log-facility=/var/log/dnsmasq.log

    log-async
    log-dhcp
    log-queries


###Adding the Webserver for Rickroll

Install nginx

    sudo apt-get install -y nginx

Modify the default html file with your desired content

    sudo nano /usr/share/nginx/www/index.html

Change the default server configuration settings if neccessary

    sudo nano /etc/nginx/sites-available/default

###Starting Hostapd on Boot

Edit the hostapd file

    sudo nano /etc/default/hostapd

Add the line

    DAEMON_CONF="/etc/hostapd/hostapd.conf"

###Testing

Reboot to propagate changes

    sudo reboot

See if the services are running

    sudo service hostapd status
    sudo service dnsmasq status
    sudo service nginx status

The output of this command should contain "Karma patches"

    hostapd -v


See if hostapd is functioning and recieve an output

    sudo hostapd -dd /etc/hostapd/hostapd.conf

View hostapd logs via syslog

    cat /var/log/syslog

View dnsmasq log for problems

    sudo cat /var/log/dnsmasq.log

View dnsmasq log for clients

    sudo cat /var/log/dnsmasq.log | grep provides | awk '{print $9}' | sort | uniq

###Notes

A limiting factor of this prank is that devices attempt to test their network status upon initial connection to a new wifi network, which can be inhibited by redirecting all of the DNS requests to a local server. If the devices are not able to reach their servers then the device will either spout a warning or, in the case of iOS, will display a captive portal page showing a stripped down version of the rickroll page.

To partially mitigate this problem DNS pass throughs can be added to the dnsmasq config file i.e. `server=/example.com/8.8.8.8`. Even though this modification will enable the device to connect, the device switching from cellular to wifi can be slow.

When navigating to a website that uses ssl the rickroll page will not function. Also, cached pages can provide issues.

Karma doesn't seem to work that well as it can only emulate unencrypted networks. A prime hostapd ssid such as `FreeWifi` can help mitigate this problem. Here is a list of other popular network names available through [wigle](https://wigle.net/gps/gps/main/ssidstats).
