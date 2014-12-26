---
layout: post
title: Syncing iTunes Music Database with Dropbox [Windows]
excerpt: A simple setup for syncing and backing up the music meta data of an iTunes library.
---

###Introduction
Syncing and backing up the music meta data of an iTunes library can be useful for maintaining information of songs imported from third party sources. Syncing of the library music data can be easily achieved using symbolic links and [Dropbox](https://www.dropbox.com/).

###Setup
1. Move the `iTunes` folder from the default `Music` folder to your `Dropbox` folder
2. Open Command Prompt
3. Create a symbolic link by typing:
	
		mklink /J "Path_to_new_folder_in_Dropbox" "Path_to_location_of_old_iTunes_folder_in_Music_folder"
		
4. Triumph


	