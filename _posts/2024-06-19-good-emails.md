---
layout: post
title: "Good Emails"
description: "With examples"
---

I've been saving emails that look good for a while now and have come up with some basic criteria for what makes an email good.

## Things Good Emails Have

### Look good with images turned off

To avoid tracking, some email clients default to images disabled, so the email shouldn't look busted without them.

### Designed well

Clear hierarchy, call to action if there is one.

Fonts and font colors have good contrast and are easy to read on mobile.

Generally looks good ✨.

### Link to view in browser

In case the email renders poorly in an email client, allow the user to view it in a proper browser.

### Link at the bottom for login / confirmation style emails

If you have to click a button or similar, have a link in the bottom that's equivalent, in case the button doesn't look like a button to the user.

### Mobile and desktop friendly

Should look good on your phone and on a desktop. Shouldn't have to pinch and zoom on mobile.

### Darkmode support

Nice to have really, you can have a nice email without it, [but you should test for it](https://steve.dignam.xyz/2023/03/02/darkmode-for-emails/).

### Plain text and html version

Compatibility is important, not all email clients render html well, and not everyone wants an html email.

### Maybe: Security footer message

[Linkedin includes some personalized content in the footer](https://www.linkedin.com/help/linkedin/answer/a1339250/) in an attempt to ward off phishing emails, not sure it's necessary.

### Maybe: Unique id in the email

In Stripe's transactional emails, they include the email ID at the bottom with:

> Need to refer to this message? Use this ID: em_lutjkoiflwurygrrsjtiy5okcouhtt

I'm not sure this is necessary if you have a "view in browser" link, but probably wouldn't hurt.

## Some examples

### Vanguard

<div style="display:flex;justify-content:center;">
<img src="/assets/good-email-vanguard.png" width="550" alt="vanguard email">
</div>

### Linear

<div style="display:flex;justify-content:center;">
<img src="/assets/good-email-linear.png" width="550" alt="linear email">
</div>

### Stripe

<div style="display:flex;justify-content:center">
<img src="/assets/good-email-stripe.png" width="550" alt="stripe email">
</div>

### Economist

<div style="display:flex;justify-content:center;">
<img src="/assets/good-email-economist.png" width="550" alt="economist email">
</div>
