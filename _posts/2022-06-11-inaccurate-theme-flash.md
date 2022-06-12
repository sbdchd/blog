---
layout: post
title: Inaccurate Theme Flashing
description: Some examples
---


I read a [recent blog post by Jim Nelson](https://blog.jim-nielsen.com/2022/avoiding-flash-of-inaccurate-theme-color/) about ["flash of inaccurate color theme"](https://css-tricks.com/flash-of-inaccurate-color-theme-fart/) and I've been noticing it more and more.

There are plenty of sites that get dark mode / theming right: Stack Overflow,
GitHub, Google, etc. but it isn't universal.

And here are some examples:

### Twitch's mobile site

<video src="/assets/theme-mobile-twitch.mp4" height="500" muted loop controls style="display: block; margin-left: auto; margin-right: auto"></video>

The Twitch desktop site is fine, but there is an initial flash of the wrong
theme with the mobile site.

On a repeat visit, the issue doesn't persist because a cookie is set for the
theme and the second page visit includes the proper styling.

### Youtube's mobile site

<video src="/assets/theme-mobile-youtube.mp4" height="500" muted loop controls style="display: block; margin-left: auto; margin-right: auto"></video>

Like Twitch, the desktop site is fine. On mobile however, there is a flash of the wrong theme.

The issue in this case is that the site loads with the background set to a light color
via inlined css. Then a CSS file that defines the theme background color
loads and overrides the initial color with the correct theme.

### Sentry

<video src="/assets/theme-sentry.mp4" height="500" muted loop controls style="display: block; margin-left: auto; margin-right: auto"></video>

Sentry shows an initial static page while the JS of the app loads in, this
static page doesn't have theming, so it results in a mismatch when the
dashboard loads.

### Stripe API docs

<video src="/assets/theme-stripe-api-docs.mp4" height="500" muted loop controls style="display: block; margin-left: auto; margin-right: auto"></video>

The Stripe API docs don't have the proper theme on initial load. Future loads
result in the correct theme due to a cookie being set.

### Feedly

<video src="/assets/theme-feedly.mp4" height="500" muted loop controls style="display: block; margin-left: auto; margin-right: auto"></video>

Pretty much the same setup as Sentry, there is an initial static page that is
shown while the JS loads, and it doesn't have proper theming. Their mobile app
has a similar issue.

### Apollo GraphQL docs

<video src="/assets/theme-apollo-graphql-docs.mp4" height="500" muted loop controls style="display: block; margin-left: auto; margin-right: auto"></video>

The Apollo docs look pretty buggy! The server returns html with a dark mode css
class name set, then on load the class name switches to light, before quickly
switching back to dark. I think the issue is that there is a
`transition-property: background-color` on the `<body>`, so the switch is delayed
by `transition-duration: var(--chakra-transition-duration-normal);` which is
set to `200ms`.


## Conclusion

Initial load is important, be careful when implementing theming.
