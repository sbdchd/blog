---
layout: post
title: Multiple Wifi Networks with WPA_Supplicant
excerpt: Add the ability to connect to multiple Wifi networks using wpa_supplicant. Great for using linux devices in more than one location.
---
1. Edit Wpa Supplicant Configuration File

		sudo nano /etc/wpa_supplicant/wpa_supplicant.conf

	Add networks with the following format
	
		network={
			ssid="SCHOOLS NETWORK NAME"
			psk="SCHOOLS PASSWORD"
			proto=WPA
			key_mgmt=WPA-PSK 
			pairwise=TKIP
			auth_alg=OPEN
			id_str="school"
		}
2. Edit Network Interfaces

		sudo nano /etc/network/interfaces
	
	Add the following
	
		auto lo

		iface lo inet loopback
		iface eth0 inet dhcp

		allow-hotplug wlan0
		iface wlan0 inet manual
		wpa-roam etc/wpa_supplicant/wpa_supplicant.conf
		iface default inet dhcp
		
3. Testing Wpa_Supplicant Setup

		sudo wpa_supplicant -iwlan0 -c/etc/wpa_supplicant/wpa_supplicant.conf -d
		
	If errors are continually thrown you may need to remove the wlan0 file
	
		sudo rm -rf /var/run/wpa_supplicant/wlan0
		
4. Once Working, Restart

		sudo reboot
		
###Notes
If your device is connected to a router or network with two or more network devices, be careful of conflicting local IPs.