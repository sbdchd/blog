---
layout: post
title: "Dark Mode for Emails"
description: "Auto conversion and media queries"
---

You can use plain text for your transactional and marketing emails, but for a more professional look you'll want to have designed HTML emails.

However, email clients are notorious for their HTML quirks.

So how do you make your email look good and support modern features like [`prefers-color-scheme` (light/dark mode)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)?

## Let the Mail Client Handle It

Apple's Mail.app (among others) will automatically display some emails with their colors converted to dark mode friendly alternatives.

The best I could find on the heurstics for this conversion was a [post from Litmus](https://www.litmus.com/blog/the-ultimate-guide-to-dark-mode-for-email-marketers/).

But we want to support all mail clients, so this won't work.

## Media Queries

While not used that often, mail clients support [media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries).

I've seen a number of emails that Mail automatically renders in dark mode but only one dark mode email using media queries: [Chownow](https://www.chownow.com)

<div style="display:flex;justify-content:center;">
<img src="/assets/chownow-email.png" width="500">
</div>

Chownow [sends emails with media queries](https://gist.github.com/sbdchd/12326a0d56d8cb6df26f24f12bda8b93) to render in both light and dark modes and also includes some media queries to handle different screen sizes.

```css
@media (prefers-color-scheme: dark) {
  .em_body {
    background-color: #282828 !important;
  }
  .em_body1 {
    background-color: #4d4d4d !important;
  }
  .em_txt_white {
    color: #ffffff !important;
  }
  /* --snip-- */
}
```

## Conclusion

Some mail clients will _sometimes_ render your email with dark mode styling, so make sure it looks good.

But it's even better if you use media queries to support dark mode.
