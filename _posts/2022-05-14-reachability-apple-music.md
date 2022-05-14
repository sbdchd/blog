---
layout: post
title: Reachability and Apple Music
description: UIKit has forsaken us
---

Reachability is [a feature on
iOS](https://support.apple.com/guide/iphone/reachability-iph145eba8e9/ios) that
makes reaching the top of the screen easier. It's especially useful when you
only have one hand available.

But menus in iOS don't play well with reachability!

## demo

1. Open the Music app
2. Navigate to an album
3. Trigger reachability
4. Press the three dot button in the upper right
5. Trigger reachability again and try and press one of the top buttons in the drop down -- you can't!


<video src="/assets/music-reaching.mp4" height="500" controls style="display: block; margin-left: auto; margin-right: auto"></video>


## conclusion

Using reachability closes menus in iOS, so you can't access the menu items!
