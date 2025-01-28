---
layout: post
title: "Port Forwarding With Xfinity and MoCA"
description: "A workaround for their app"
---

## The Problem

When trying to setup port forwarding with Xfinity/Comcast, you can't do it through the usual `10.0.0.1` web interface if you're using their provided modem/router.

Instead you have to use the [Xfinity app](https://apps.apple.com/us/app/xfinity/id1178765645).

If you follow [their guide](https://www.xfinity.com/support/articles/port-forwarding-xfinity-wireless-gateway), you navigate to `Wifi > View Wifi equipment > Advanced settings > Port forwarding > Add Port Forward`, but then in the drop down, you won't see the MoCA connected device!

For [some reason](https://www.reddit.com/r/HomeNetworking/comments/vg4df8/comment/id03kts/), if you're using MoCA, the device won't be there and there isn't a way to manually specify the device.

## The Workaround

1. Disconnect your device from MoCA
2. Connect it via ethernet to the modem
3. Restart the modem and the app
4. Add the port forward
5. Disconnect the ethernet and reconnect MoCA

Fin
