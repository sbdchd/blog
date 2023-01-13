---
layout: post
title: "Preloading with JS Apps"
description: "Injecting some JSON and metadata into the page"
---

**Terms:**

- Client Side Rendered (CSR) — Browser loads a static html page which fetches data
- Server Side Rendered (SSR) — Server returns html on the fly from templates/views/components to the Browser (no follow up data fetch)

## Preloading

With a server side rendered site, you’ll probably have some context variables in your http handlers, with things like the current user, their organization/team, feature flags, etc. to make returning user specific content easier.

With a client side rendered app, you don’t have the same luxury, instead you return a static html file with Javascript and fetch any user specific data on load.
This isn’t great for initial loads because you have to wait for the HTML & JS to load before you can even start fetching data from the server.

You could server side render your client side app, but that can be a tall order as you have to deal with the split between client only APIs and server APIs.

Another option is to inject the static index.html page with the user specific data, usually via a json blob parsed on page load.

This gives you a few benefits:

- web app code stays the same -- don’t have to worry about server only APIs vs client only APIs
- avoids the delay with fetching after initial load
- support metadata for search engines/scrapers (iMessage, Discord, Slack, Facebook, Twitter, etc.) without having to use [user agent specific hacks](https://github.com/recipeyak/recipeyak/blob/adc4bf5512fe8ae451e7006ae9638fb2fe06d82e/backend/recipeyak/api/urls.py#LL99C61-L99C61) (see Trello)

## Preload Examples

- [Figma](https://gist.github.com/sbdchd/40cc0b40493966b902c511e4191d7bc0#file-figma-preload-json)
- [Stripe](https://gist.github.com/sbdchd/40cc0b40493966b902c511e4191d7bc0#file-stripe-preload-html)
- [Cooking NYTimes ](https://gist.github.com/sbdchd/ed7e5ca860d90b52fb2e03a6ca0ae508#file-preload-json)

## Conclusion

Client side rendered apps are easy to deploy, but server side rendering helps with initial load times and supporting search engines/scrapers.
