---
layout: post
title: Add a Send as Email in Gmail
excerpt: A guide to adding an alternative email to send from via Gmail.
---
Sending emails from your normal Gmail address is fine but if you want to send emails
from your custom domain (more professional?) then you would normally have to setup 
your own smtp server. However, you can send emails from your custom domains with Gmail 
even though it is not obvious.
 

###Setting Up an Alias Email
1. Enter into settings via the `cog` in the upper right 
hand corner of the default Gmail screen.
2. Select `Accounts and Import`
3. Under `Send mail as:`, select `Add another email address you own`
4. Enter the email that you want to be able to send as on first page of the 
prompt. Also enter a useful name to be associated with the address 
such as your own name or a business. Keep `Treat as an alias.` checked and select `Next Step >>`
5. Replace `smtp.your_domain.com` with `smtp.gmail.com`
6. Enter your Gmail email in the `username` box and enter your Gmail 
password (Or your application specific password) in the `password` box. Leave the port set to `587` 
and leave `Secured connection using TLS` checked. Select `Add Account >>`
7. Make sure to verify the email as prompted