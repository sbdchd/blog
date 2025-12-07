---
layout: post
title: "Login via QR Code is Slick"
description: "Need an app"
last_modified_at: 2025-12-06
---

Discord, TikTok, Steam, and Vanguard all support scanning QR codes to login:

<img src="/assets/qr-code-login-discord.png" width="700" alt="discord login page with qr code">

<img src="/assets/qr-code-login-tiktok.png" width="700" alt="tiktok login page with qr code">

<img src="/assets/qr-code-login-steam.png" width="700" alt="steam login page with qr code">

<img src="/assets/qr-code-login-vanguard.png" width="700" alt="vanguard login page with qr code">

It's a pretty quick way to login, the only caveat is you need to have their
mobile app installed.

And because of this, services / sites / projects without mobile apps can't support this login method.

## Confirming

There's also some security risk where an attacker gets a user to scan a QR code the attacker generated on their own computer, allowing them access to the user's account.

Steam's confirm page does the best job at attempting to prevent this attack:

<div style="display:flex;justify-content:center;">
<img src="/assets/qr-code-login-confirm-steam.png" height="700" alt="steam qr code login confirm">
</div>

Discord has a general warning:

<div style="display:flex;justify-content:center;">
<img src="/assets/qr-code-login-confirm-discord.png" height="700" alt="discord qr code login confirm">
</div>

While TikTok is pretty sparse:

<div style="display:flex;justify-content:center;">
<img src="/assets/qr-code-login-confirm-tiktok.png" height="700" alt="tiktok qr code login confirm">
</div>

## Conclusion

This login method is nice, but requires users to have the service's app downloaded.
