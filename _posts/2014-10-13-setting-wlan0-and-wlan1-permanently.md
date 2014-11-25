---
layout: post
title: Setting Wlan0 and Wlan1 Permanently
excerpt: A quick guide on setting specific adaptors to wlan0 and wlan1 on raspbian. 
---

1. Open Persistent Net Gen Rules
	
		sudo nano /lib/udev/rules.d/75-persistent-net-generator.rules
		
2. Edit Persistent Net Gen Rules

	Modify the following lines:
	
		# device name whitelist
		KERNEL!="ath*|msh*|ra*|sta*|ctc*|lcs*|hsi*", \
		GOTO="persistent_net_generator_end"
	
	to
	
		# device name whitelist
		KERNEL!="ath*|wlan*[0-9]|msh*|ra*|sta*|ctc*|lcs*|hsi*", \
		GOTO="persistent_net_generator_end"

4. Shutdown Raspberry Pi
	
		sudo shutdown -h now
		
5. Setting Wlan0 to Specific Adaptor

	Remove the wifi adaptor that you want to be known as `wlan1`. The one that remains connected will be set as `wlan0`.
	
6. Reboot Raspberry Pi

		sudo reboot
		
7. Upon Login Shutdown Pi

		sudo shutdown -h now
		
8. Setting Wlan1 to Specific Adaptor
	
	Plug in the adaptor that you want to be called `wlan1`.
	
9. Reboot Raspberry Pi

		sudo reboot
		

Now each time the Pi boots the wifi adaptors should be permanently set to their name.

If you wish to change the assigned adaptor names either remove 
the file `/etc/udev/rules.d/70-persistent-net.rules` and restart the process or simply edit that file.