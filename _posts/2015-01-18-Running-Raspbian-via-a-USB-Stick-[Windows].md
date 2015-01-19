---
title: Running Raspbian via a USB Stick [Windows]
excerpt: A quick guide to running raspbian off of a usb stick for potentially more stability.
layout: post
---

###Note
If you have a non-booting sd card that has a readable boot partition then you do **not** need to format the sd card and burn a new image.

###Formatting an SD Card
1. Download [SD Formatter v4.0](https://www.sdcard.org/downloads/formatter_4/eula_windows/)
2. Insert SD Card into computer
3. Open the SD Formatter software
    * Set `Format Type` to `Full(Overwrite)`
    * Set `Format Size Adjustment` to `Off`
4. Select `Format` It may take several minutes

###Formatting an USB Drive
1. Open `Command Prompt (Admin)`
2. Then use `diskpart.exe`
3. Type `list disk` and note the number of your USB drive
4. Type `select disk #` replacing `#` with the USB drive number
5. Use the following commands

        clean
        create partition primary
        select partition 1
        active
        format fs=FAT32 QUICK
        assign
        exit

###Burning a New Image to the SD Card & USB Drive
1. Download [Win32DiskImager](http://sourceforge.net/projects/win32diskimager/)
2. Insert SD card into computer
3. Open Win32DiskImager
    * In the `image file` box, enter the path of your image file
    * *Example:* C:\Users\Joe\Desktop\rpi.img
4. Under the `Device` box, select your SD card
5. Click the `Write` button to create the image file

###Changing the Boot Location
1. Insert the SD Card into the your computer and open the `cmdline.txt` file
2. Change `root=/dev/mmcblk0p2` to `root=/dev/sda2`
3. Save and exit

###Testing
Make sure that the SD card and USB stick are plugged into the raspberry pi and boot.
You may want to expand the file system on the USB stick using [fdisk](http://raspberrypi.stackexchange.com/questions/499/how-can-i-resize-my-root-partition).

###Tips
Using the USB as root can help prevent improper boots and corruption but changing the sd card to read only can also increasing longevity.

Overclocking the pi has also been known to increase the risk of corruption.

Also, make sure to shutdown the pi via `sudo shutdown -h now` instead of unplugging it to prevent improper writes.