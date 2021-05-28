---
layout: post
title: Better Review Apps
description: aka Preview Deployments, Deploy Previews, etc.
date: 2021-05-28
---

Having a one off environment for each commit / PR is really handy.

There are plenty of services that [will][heroku] [build][vercel] [and][netlify]
[deploy][cloudflare] [your][gitlab] [static][layerci] [site][release] to a
preview environment for each commit, but most breakdown when it comes to more
complicated deployments.

For a production app, you're likely to have:

- Database (Postgres, MySQL, Mongo, etc.)
- Queues (Redis, Rabbitmq, SQS, etc.)
- Background Workers (Celery, RQ, Sidekiq, etc.)
- Search Engine (Elasticsearch, Solr, Algolia, etc.)
- Object Storage (S3, Cloud Storage, etc.)
- PubSub (SNS, Ably, Pusher, PubNub, Firebase, Redis, etc.)
- Cache (Redis, Memcached, Varnish, etc.)
- HTTP Servers (API, Server Rendered HTML, etc.)
- Static Files (CSS, JS, HTML, etc.)
- Webhooks
  - Email
  - SMS
  - Stripe
- OAuth sign-in

## Dealing with State

Of the above components, most are stateless or can be safely wiped between
deploys (queues, cache, etc.), but a few trickier to handle:

### storage -- databases, object storage, search engines

For the databases and search engines, we could:

- populate via manual scripts
- restore from a database backup
- create a [COW][cow] snapshot of anonymized prod data like Skroutz's dev setup [outlined in their kernel bug hunt](https://engineering.skroutz.gr/blog/uncovering-a-24-year-old-bug-in-the-linux-kernel/)

Object storage is more complicated, but we could:

- populate via manual scripts
- copy from an existing bucket

### oauth

Redirect URIs are tricky since they need to be strict for security.

For example, [Slack][slack-oauth] and [GitHub][github-oauth] only allows redirect uris that are
subdirectories of the configured uri. So if we wanted our preview envs to have
urls like: `pr-10.preview.foo.com` and `sha-a123ef.preview.foo.com`,
and our configured url is `app.foo.com` we'd be out of luck.

One option is to have a proxy with a url like `oauth-dev-proxy.foo.com` that
is configured as the redirect uri for a given OAuth app.

Then all the review apps could have sub paths under that like,
`oauth-dev-proxy.foo.com/preview/pr-10/` and
`oauth-dev-proxy.foo.com/preview/sha-a123ef` which the proxy would
redirect accordingly to `pr-10.preview.foo.com` and
`sha-a123ef.preview.foo.com`.

Some OAuth providers, [like Slack][slack-redirect-urls], allow providing
multiple redirect urls for a given OAuth app, so we could add a url each time
we deploy a given env. However, this isn't universal, Github for example
doesn't support multiple redirect urls, so a proxy seems like the best bet.

### webhooks

Since webhooks inherently involve a third party calling your endpoint, they
can't be shared like OAuth, so each preview env will need its own
config/account.

For instance maybe you configured your third party email provider to send
inbound emails to `staging.foo.com` and it sends outbound email with
`staging@foo.com`.

For the preview envs we'd need a unique config and email for each.
The preview env for PR #10 would get url: `pr-10.preview.foo.com` and would use
`pr-10.preview@foo.com` for sending email.

When a user replies, the third party mail provider would send the inbound
email via HTTP to `pr-10.preview.foo.com`

For SMS, using a service like Twilio, we'd need to do something similar where
we setup a new phone number for the environment that is used for sending and
we configure the callback url for inbound messages from that env's specific
number.

## Conclusion

Preview environments for production apps are not as easy as deploying static
sites, but are doable.

Setting up miscellaneous third party services, like email and sms, can be
achieved by running user defined scripts a la [Heroku's Release
Phase](https://devcenter.heroku.com/articles/release-phase).

Datastores can be populated manually, restored from backup, or created with a
filesystem snapshot.

PS: speed is essential, waiting 30 minutes for a usable preview env is too long.

[heroku]: https://devcenter.heroku.com/articles/github-integration-review-apps
[vercel]: https://vercel.com/docs/platform/deployments#preview
[netlify]: https://www.netlify.com/products/deploy-previews/
[cloudflare]: https://developers.cloudflare.com/pages/platform/preview-deployments
[gitlab]: https://docs.gitlab.com/ee/ci/review_apps/
[layerci]: https://layerci.com/
[homerolled]: https://engineering.skroutz.gr/blog/uncovering-a-24-year-old-bug-in-the-linux-kernel/
[release]: https://releasehub.com/
[slack-oauth]: https://api.slack.com/authentication/oauth-v2#redirect_urls
[slack-redirect-urls]: https://api.slack.com/authentication/oauth-v2
[github-oauth]: https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#redirect-urls
[cow]: https://en.wikipedia.org/wiki/Copy-on-write
