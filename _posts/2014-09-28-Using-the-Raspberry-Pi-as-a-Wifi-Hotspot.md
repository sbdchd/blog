---
layout: post
title: Using the Raspberry Pi as a Wifi Hotspot
excerpt: A basic guide to setting up a wifi hotspot on the Raspberry Pi using an Edimax wifi dongle.
---
1.	Installing the Necessary Software
	
	Use the following commands:

	
		sudo apt-get install isc-dhcp-server hostapd
		wget http://dl.dropbox.com/u/1663660/hostapd/hostapd.zip
		unzip hostapd.zip
		sudo mv /usr/sbin/hostapd /usr/sbin/hostapd.original
		sudo mv hostapd /usr/sbin/hostapd.edimax
		sudo ln -sf /usr/sbin/hostapd.edimax /usr/sbin/hostapd
		sudo chown root.root /usr/sbin/hostapd
		sudo chmod 755 /usr/sbin/hostapd
		

2.	Edit the DHCP Config File ([Sample File](https://www.dropbox.com/s/u6hstloap288s57/dhcpd.txt?dl=0))

		sudo nano /etc/dhcp/dhcpd.conf
	
	Uncomment the line containing `authoritative;` (Remove the `#`)
	
	Then edit the `configuration for an internal subnet` with the following lines:
		
		subnet 10.5.5.0 netmask 255.255.255.0 {
		range 10.5.5.100 10.5.5.150;
		option routers 10.5.5.1;
		option broadcast-address 10.5.5.255;
		default-lease-time 600;
		max-lease-time 7200;
		option domain-name "local-network";
		option domain-name-servers 8.8.8.8, 8.8.4.4;
		}
		
3.	Edit the Network Interfaces File

		sudo nano /etc/network/interfaces
		
	It should look like this:
	
		auto lo

		iface lo inet loopback
		iface eth0 inet dhcp

		allow-hotplug wlan0

		iface wlan0 inet static
			address 10.5.5.1
			netmask 255.255.255.0
			
4.	Edit the ISC DHCP Server File
	
	Modify the line with `INTERFACES=""` to look like the following:

		INTERFACES="wlan0"
		
	If you have more than one wifi dongle change `wlan0` appropriately, along with the following steps
	
5. Creating and Editing the Hostapd Configuration File

		sudo nano /etc/hostapd/hostapd.conf
		
	It should look like the following:
	
		# Basic configuration

		interface=wlan0
		ssid=Pi
		channel=1
		#bridge=br0

		# WPA and WPA2 configuration

		macaddr_acl=0
		auth_algs=1
		# Change 0 to 1 to make Hidden Network
		ignore_broadcast_ssid=0
		wpa=3
		wpa_passphrase=Raspberry
		wpa_key_mgmt=WPA-PSK
		wpa_pairwise=TKIP
		rsn_pairwise=CCMP

		# Hardware configuration

		driver=rtl871xdrv
		ieee80211n=1
		hw_mode=g
		device_name=RTL8192CU
		manufacturer=Realtek
		
	If you are using a wifi dongle besides the [Edimax](http://www.amazon.com/dp/B003MTTJOY), change the `manufacturer` and `device_name`
	
6. Editing the Hostapd File

		sudo nano /etc/default/hostapd
		
	Modify the line with `DAEMON_CONF=""` to the following:
	
		DAEMON_CONF="/etc/hostapd/hostapd.conf"

8. Reboot the Raspberry Pi

		sudo reboot

		
7. Making sure Hostapd and DHCP are functioning

	Check if hostapd and the dhcp server are running by using the following commands:
	
		sudo service hostapd status
		sudo service isc-dhcp-server status
		
	If either hostapd and isc-dhcp-server are not working correctly try the following commands:
	
		sudo ifconfig wlan0 down
		sudo ifconfig wlan0 10.5.5.1
		sudo service hostapd start
		sudo service isc-dhcp-server start
		sudo service hostapd status && sudo service isc-dhcp-server status
		
	If the two services still arn't working try the following:
	
		sudo ln -s /etc/init.d/hostapd /etc/rc2.d/S02hostapd
		sudo update-rc.d hostapd enable
		sudo update-rc.d isc-dhcp-server enable
		
	Another way to test hostapd and receive an output is by using the following command:
	
		sudo hostapd -dd /etc/hostapd/hostapd.conf
	




####Note:

Using `sudo apt-get upgrade` can overwrite the Edimax friendly 
version of hostapd, requiring of a reinstall the correct hostapd version.
