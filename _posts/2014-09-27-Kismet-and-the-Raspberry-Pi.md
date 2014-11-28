---
layout: post
title: Kismet and the Raspberry Pi
excerpt: A basic tutorial for installing and using Kismet on a Raspberry Pi.
---
###Installation

Use the following commands:

	sudo apt-get install libncurses5-dev libpcap-dev libpcre3-dev libnl-dev
	wget http://www.kismetwireless.net/code/kismet-2013-03-R1b.tar.xz
	tar xvJf kismet-2013-03-R1b.tar.xz
	mv kismet-2013-03-R1b kismet
	cd kismet
	./configure
	make
	sudo make suidinstall
	sudo usermod -a -G kismet pi

Reboot

	sudo reboot
		
Edit the Kismet Configuration File

	sudo nano /usr/local/etc/kismet.conf 
		
Add the following lines

	ncsource=mon0
	hidedata=true
		
###Using Kismet

Set Wifi adaptor into monitor mode

	sudo iw phy phy0 interface add mon0 type monitor
	sudo iw dev wlan0 del
		
Start Kismet

	kismet_client
	
Setting Wifi adaptor back to managed mode

	sudo iw phy phy0 interface add wlan0 type managed
	sudo iw dev mon0 del
		
