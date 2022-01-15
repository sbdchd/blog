---
layout: post
title: Hosting Apps on a Subdomain?
description: "A Survey"
---

A few years back I thought it was slick that Trello hosted their app on the same domain as their landing page, so we [copied that for Recipe Yak](https://github.com/recipeyak/recipeyak/commit/df53a69272be40e1666314082b6a7bb6308479f8).

On the other hand, [Kodiak](https://kodiakhq.com) has its app on a separate domain hosted on Digital Ocean, while the landing page / doc site is hosted on Netlify.

The choice of subdomain or no subdomain came up again on the [Placemark blog](https://www.placemark.io/post/engineering-round-up), which also linked to a [related tweet](https://twitter.com/tylertringas/status/1250521285630836741).
Both the tweet and post recommended hosting your app on a separate domain, which definitely simplifies things.

But what do most people do? Do they host their app on a separate domain?

Here are the results from my incomplete survey:

| site          | domain type      |
| ------------- | ---------------- |
| Ably          | same domain      |
| Airbnb        | same domain      |
| AWS           | different domain |
| Basecamp      | different domain |
| CircleCI      | different domain |
| Cloudflare    | different domain |
| Crunchy Data  | same domain      |
| Datadog       | different domain |
| Digital Ocean | different domain |
| Discord       | same domain      |
| Dropbox       | same domain      |
| Elastic       | different domain |
| Facebook      | same domain      |
| Feedly        | same domain      |
| Figma         | same domain      |
| GitHub        | same domain      |
| Gitlab        | different domain |
| Google Cloud  | different domain |
| Heroku        | different domain |
| Hey           | different domain |
| Instagram     | same domain      |
| Linear        | same domain      |
| Mux           | different domain |
| Netflix       | same domain      |
| Netlify       | different domain |
| Notion        | same domain      |
| Paper         | different domain |
| Planetscale   | different domain |
| Reddit        | same domain      |
| Segment       | different domain |
| Sentry        | same domain      |
| Slack         | different domain |
| Spotify       | different domain |
| Stripe        | different domain |
| TikTok        | same domain      |
| Trello        | same domain      |
| Twitch        | same domain      |
| Twitter       | same domain      |
| Vercel        | same domain      |
| Youtube       | same domain      |

## Conclusion

The only pattern I see is that social media sites use the same domain, otherwise it's variable.
