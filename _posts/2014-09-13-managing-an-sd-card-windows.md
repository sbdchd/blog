---
layout: post
title: Backing Up SD Card [Windows]
excerpt: A guide to basic management of an SD card, including backing up and formatting. Important steps for a Raspberry Pi.
---
###Backing Up an SD Card
1. Download [Win32DiskImager](http://sourceforge.net/projects/win32diskimager/)
2. Insert SD card into computer
3. Open Win32DiskImager
	* In the `image file` box, enter the path of your soon-to-be image file
	* *Example:* C:\Users\Joe\Desktop\rpi.img
4. Under the `Device` box, select your SD card
5. Click the `Read` button to create the image file
6. *Optionally:* Shrink image file using 7-Zip or link program

###Formatting an SD Card
1. Download [SD Formatter v4.0](https://www.sdcard.org/downloads/formatter_4/eula_windows/)
2. Insert SD Card into computer
3. Open the SD Formatter software
	* Set `Format Type` to `Full(Overwrite)`
	* Set `Format Size Adjustment` to `Off`
4. Select `Format` It may take several minutes
   