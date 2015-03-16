---
title: Connecting to a Raspberry Pi Directly via Ethernet
excerpt: A simple setup for easily connecting to a Raspberry Pi or other linux box using a normal ethernet cable.
layout: post
---

###Client Network Configuration

####Windows
Open the `Network Connections` and then the ethernet adaptor's `Properties`. Select the `TCP/IPv4` option and ensure the option `Obtain an IP address automatically` is checked.

####Mac
Open the `Network` settings page and navigate to the `Ethernet` section. Make sure `Using DHCP` is selected from the `Config IPv4` dropdown.

####Linux
Locate the `IPv4 Settings` for the `Wired Connection` and ensure `Automatic (DHCP)` is selected.


###Raspberry Pi Setup
Open the `/boot/cmdline.txt` file on the Pi via the Pi itself or by viewing the boot partition of the sd card on another computer.

Add the following line to the end of the file `ip=169.254.0.5`

*Note:* The IP must be in the [link-local](http://en.wikipedia.org/wiki/Link-local_address) IP range `169.254.1.0 to 169.254.254.255`

###Connecting
Connect an ethernet cable between the computer and Raspberry Pi.

Start your Pi and SSH to the previously defined IP address. (It may take a bit before you are able to connect)
