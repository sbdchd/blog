---
layout: post
title: Custom MOTD for SSH Logins
excerpt: Simply setup a custom message of the day for when logging into a Linux device via SSH.
---
###Basic Setup
1. Remove the Contents of the MOTD file

		sudo nano /etc/motd
		
2. Edit Another MOTD File

		sudo nano /etc/init.d/motd
		
	Comment Out the Following Line
	
		uname -snrvm > /var/run/motd.dynamic
		
3. Edit the sshd Configuration File

		sudo nano /etc/ssh/sshd_config
		
	Change the line `PrintLastLog yes` to `PrintLastLog no`
	
4. Edit the MOTD File

		sudo nano /etc/motd.tcl
		
	Add your custom message of the day
	
	*Example:*
		
		#!/usr/bin/env tclsh

		set var(user) $env(USER)
		set var(path) $env(PWD)
		set var(home) $env(HOME)

		if {![string match -nocase "/home*" $var(path)] && ![string match -nocase "/usr/home*" $var(path)] } {
		  return 0
		}

		# Last Login
		set lastlog [exec -- lastlog -u $var(user)]
		set ll(1)  [lindex $lastlog 7]
		set ll(2)  [lindex $lastlog 8]
		set ll(3)  [lindex $lastlog 9]
		set ll(4)  [lindex $lastlog 10]
		set ll(5)  [lindex $lastlog 6]

		# Uptime
		set uptime    [exec -- /usr/bin/cut -d. -f1 /proc/uptime]
		set up(days)  [expr {$uptime/60/60/24}]
		set up(hours) [expr {$uptime/60/60%24}]
		set up(mins)  [expr {$uptime/60%60}]
		set up(secs)  [expr {$uptime%60}]

		# Disk Usage
		set usage [lindex [exec -- /usr/bin/du -ms $var(home)] 0]

		# SSH Logins
		set logins    [lindex [exec -- who -q | cut -c "9-11"] 0]

		# Ram Usage
		set memory  [exec -- free -m]
		set mem(t)  [lindex $memory 7]
		set mem(u)  [lindex $memory 8]
		set mem(f)  [lindex $memory 9]
		set mem(c)  [lindex $memory 16]
		set mem(s)  [lindex $memory 19]

		# Temperature
		set temp [exec -- /opt/vc/bin/vcgencmd measure_temp | cut -c "6-9"]
		set tempoutput [lindex $temp 0]

		puts "   Last Login....: $ll(1) $ll(2) $ll(3) $ll(4) from $ll(5)"
		puts "   Uptime........: $up(days) days $up(hours) hours $up(mins) minutes $up(secs) seconds"
		puts "   Temperature...: $tempoutput°C"
		puts "   Memory MB.....: Total: $mem(t)  Used: $mem(u)  Free: $mem(f)  Cached: $mem(c)  Swap: $mem(s)"
		puts "   Disk Usage....: ${usage}MB in $var(home) Used"
		puts "   SSH Logins....: Currently $logins user(s) logged in."

		if {[file exists /etc/changelog]&&[file readable /etc/changelog]} {
		  puts " . .. More or less important system informations:\n"
		  set fp [open /etc/changelog]
		  while {-1!=[gets $fp line]} {
			puts "  ..) $line"
		  }
		  close $fp
		  puts ""
		}
5. Make the Script Executable

		sudo chmod 755 /etc/motd.tcl
		
6. Edit Profile File

		sudo nano /etc/profile
		
	Add the following to the end
	
		/etc/motd.tcl