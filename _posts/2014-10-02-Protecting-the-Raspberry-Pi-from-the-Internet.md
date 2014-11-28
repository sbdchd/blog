---
layout: post
title: Protecting the Raspberry Pi from the Internet
excerpt: A simple guide to installing and configuring IPTables and Fail2Ban on the Raspberry Pi.
---

###IPTables
1. Edit Network Interfaces

		sudo nano /etc/network/interfaces
		
	Add the following to the end of the file
	
		pre-up iptables-restore < /etc/network/iptables
		
2. Edit IPTables File

		sudo nano /etc/network/iptables
		
	Add the following to the file
	
	``` bash
	*filter
	:INPUT DROP [23:2584]
	:FORWARD ACCEPT [0:0]
	:OUTPUT ACCEPT [1161:105847]
	-A INPUT -i lo -j ACCEPT
	-A INPUT -i eth0 -p tcp -m tcp --dport 22 -j ACCEPT
	-A INPUT -i wlan0 -p tcp -m tcp --dport 22 -j ACCEPT
	-A INPUT -m state --state RELATED,ESTABLISHED -j ACCEPT
	COMMIT
	```
	
	If you want to open up more ports, for a web server perhaps, add another set of lines similar to that of port 22.
	
		-A INPUT -i eth0 -p tcp -m tcp --dport 80 -j ACCEPT
		-A INPUT -i wlan0 -p tcp -m tcp --dport 80 -j ACCEPT

	Be sure to replace port 80 with your desired port.
3. Transfer Configuration Settings

		sudo iptables-restore < /etc/network/iptables
		
4. Confirm that IPTables Config is Correct

		sudo iptables-save

###Fail2Ban
1. Installing Software

		sudo apt-get install fail2ban
		
2. Copy Configuration File

		sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
		
3. Edit Configuration File

		sudo nano /etc/fail2ban/jail.local
		
	Edit `ignoreip = 127.0.0.1/8` with correct local IP subset
	
4. Restart Fail2Ban

		sudo service fail2ban restart
		
5. Check Current Bans List

		sudo iptables -L