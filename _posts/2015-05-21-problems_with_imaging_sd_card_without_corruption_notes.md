---
title: Avoiding Corruption with the Raspberry Pi
excerpt: Tips on helping to stave off or prevent corruption of os image with a Raspberry Pi.
layout: post
---


##Problem:
OS image for the Raspberry Pi would become corrupted and not boot with regularity

##Solution:

1. Ensure that the image for your OS of choice is in working condition. Getting a fresh download is a good idea. If you are an obsessive, you can hash it but it doesn't seem necessary.
- If using a sd card, use [SD card Formatter](https://www.sdcard.org/downloads/formatter_4/index.html) to ensure that it is properly cleared. Otherwise, just format the storage device accordingly.
- Burn your previously obtained image using [Win32 Disk Imager](http://sourceforge.net/projects/win32diskimager/) or the [dd command](https://wiki.archlinux.org/index.php/Disk_cloning).
- Connect your desired peripherals and insert your sd card / storage device.
- *Important*: Connect power with confidence (do not slowly plug in the power supply). You do not want the power of the Pi to be inconsistent, which is usually the cause of corruption.
- When powering down the Raspberry Pi make sure to first do so in the command line i.e `sudo shutdown -h now`. As unplugging the power supply can also lead to dirty power and once again, corruption.

##Takeaway:
Inconsistent power will corrupt your Raspberry Pi
