---
layout: post
title: Towards a Better Heroku
description: Requirements for a PaaS
date: 2020-10-25
last_modified_at: 2020-11-10
---

## General Setup

Before diving into what a better Heroku needs, let's outline an example
infrastructure setup.

```
                                   ┌──────────────────────────┐
┌──────────┐   ┌────────────┐      │Tests, Lints, Type check, │
│          │   │            │      │       Build Images       │
│   Code   │──▶│   GitHub   │─────▶│                          │
│          │   │            │      │        (CircleCI)        │
└──────────┘   └────────────┘      │                          │
                      │            └──────────────────────────┘
                      │
┌─────────────────────┘             ┌─────────────────────────┐
│  ┌────────────────┐               │                         │
│  │                │     Auto      │    Staging Instances    │
└─▶│Deployment Tool │────Deploy────▶│                         │
   │                │               │  (AWS, GCP, Azure, DO)  │
   └────────────────┘               │                         │
            │                       └─────────────────────────┘
        Promote                                  │
        Staging   ┌─────────────────────────┐    │
         Images   │                         │    │
            │     │  Production Instances   │    │
            └────▶│                         │    └───────────┐
                  │  (AWS, GCP, Azure, DO)  │                │
                  │                         │                │
                  └─────────────────────────┘                │
                               │                             │
                               │  ┌───────────────────────┐  │
                               │  │ Metrics, Monitoring,  │  │
                               └─▶│  Alerting, Log Drain  │◀─┘
                                  │                       │
                                  └───────────────────────┘
```

The general Heroku flow is to deploy on git push. In the example architecture
above, staging is auto-deployed whenever a commit is merged into the main
branch.

Then, through the Heroku UI (or via the CLI), we can promote the version on
staging to production without rebuilding.

In the above flow chart, Heroku handles everything from the `Deployment Tool`
onward, but requires additional third party addons for things like historical
logs. Overall, Heroku makes the deployment process easy, and infrastructure,
for the most part, can be ignored. But this comes with a cost, both in price,
and also features.

## Heroku

To determine what a Better Heroku might look like, let's outline what Heroku
does well, and areas in need of improvement.

### The Good

- [promotion](https://devcenter.heroku.com/articles/pipelines#promoting) from staging to production

  - no rebuild, uses the same ["slug"](https://devcenter.heroku.com/articles/slug-compiler) with different config

- [zero downtime deploys](https://devcenter.heroku.com/articles/preboot)

- One click [rollback](https://devcenter.heroku.com/articles/releases#rollback)

  - Can be done via the UI or the CLI

    - Can rollback with a button press to any previous
      [release](https://devcenter.heroku.com/articles/releases) via the
      Activity Feed

  - Can rollback config changes as well as version changes

- [config](https://devcenter.heroku.com/articles/config-vars)

  - [Env vars for config](https://12factor.net/config) work great

  - Changing a config value results in automated redeploy of current version with new config

- "ClickOps" - clicking around a UI instead of using a CLI, [IaC](https://en.wikipedia.org/wiki/Infrastructure_as_code), or [GitOps](https://about.gitlab.com/topics/gitops/)

  Almost all operations can be performed via the Heroku CLI and UI.

  For `promotion` between envs option to use CLI (`heroku pipelines:promote`) or the UI. I always use the UI for promotion since it
  includes a link to the git diff between staging and production.

  For env vars I tend to use the CLI:

  ```shell
  heroku config:set DATABASE_URL=postgres:// --app squirrel-farm
  heroku config:get DATABASE_URL --app squirrel-farm
  ```

- [release phase](https://devcenter.heroku.com/articles/release-phase)

  - run a shell script before you application is deployed
  - useful for running database migrations

- `logs`

  - can tail instance logs which is sometimes useful, less so as more traffic / instances as added
    - need to add a [log
      drain](https://devcenter.heroku.com/articles/log-drains) of some sort to
      search historical logs

- `ps:exec`, `ps:kill`, `run`, etc.

  - useful for running one-off scripts in a staging / prod
  - sometimes you need to connect to a box and see what's going on

- [webhooks](https://devcenter.heroku.com/articles/app-webhooks)

  - can export data or build your own integrations like Slack bots
    - related, the [API is fully featured](https://devcenter.heroku.com/articles/platform-api-reference)

- Live Graphs of CPU, Memory

  - Can get a basic overview of deploys and summarized metrics of your instances

- Activity Feed (Audit Log)
  - Who deployed and when?
  - Who edited the config vars?
  - Indicates rollbacks

### The Bad

- Limited instance choices

  - high memory instances aren't available, which can be useful for hogs like Python

- Routing architecture is limited

  - [randomly selects
    instances](https://devcenter.heroku.com/articles/http-routing#request-distribution)
    and
    there isn't anyway to change it or substitute your own load balancer
    - <https://genius.com/James-somers-herokus-ugly-secret-annotated>
      - <https://news.ycombinator.com/item?id=5215884>
    - <https://genius.com/Tom-lehman-money-trees-rap-genius-response-to-heroku-annotated>
      - <https://news.ycombinator.com/item?id=5310602>
    - <https://youtu.be/X45YY97FmL4?t=654>

- No health checks

  - can't check a health check endpoint on services

  - related, a readiness check has to be hacked into the start script instead
    of Heroku doing it automatically via an endpoint.

- container [support is lacking](https://devcenter.heroku.com/articles/container-registry-and-runtime#known-issues-and-limitations)

  - Can't promote releases between environments
  - Can't use review apps
    - But review apps are also pretty rudimentary since they share staging, so
      if you have database migrations you will mess up the staging env.

- [limited protocols](https://devcenter.heroku.com/articles/http-routing#not-supported)

  - can't use GRPC, Thrift, etc.

- managed Postgres is limited

  - doesn't support reading WAL
  - few metrics
  - Heroku hosted PgBouncer doesn't support multiple users, so roles don't
    work. Want to have different timeouts for cron workers and web servers?
    Tough luck.

- Price

  - instances have [huge markups](https://christopher.xyz/2019/01/23/heroku-dyno-sizes.html)
  - ditto on
    [Redis](https://christopher.xyz/2019/01/24/heroku-redis-vs-aws.html) and
    [Postgres](https://christopher.xyz/2019/01/24/heroku-postgres-vs-AWS.html)

- Auto Scaling

  - Heuristics for auto scaling are [limited to response
    time](https://devcenter.heroku.com/articles/scaling#autoscaling), which
    doesn't work for non-web request workloads. Even for web servers, it
    isn't particullarly useful so you'll want to use a [third party
    tool](https://www.hirefire.io) to manage the autoscaling.

- Alerting

  - Builtin alerting only works for web response times, if you want to
    alert on memory usage you have to work off the logs

- Metrics

  - aggregated across instances
  - no per instance view

- Can't configure shutoff signals

  - SIGTERMs every process, can't configure per process
    - [affects
      NGINX](https://github.com/heroku/heroku-buildpack-nginx/issues/31) which
      uses SIGTERM for hard shutdown, and SIGQUIT for
      graceful shutdown

- Buildpacks are tedious to change
  - each change involves a deploy
  - caching is manual

- disabling old versions of TLS requires [filing a ticket with Heroku
  support](https://elements.heroku.com/addons/ssl) and [adding a paid, Heroku
  add-on](https://elements.heroku.com/addons/ssl)

- Auto deploy kills waiting deploys

  - Scenario: trying to get your fix into production, Heroku auto deploys
    your fix once it hits `master`, but it first waits for CI to pass. If another
    commit hits `master` before CI finishes, then Heroku will skip
    releasing your change and start building the more recent commit.


## A Better Heroku

A Better Heroku needs to include most of the features of Heroku, with the cost
and limitations removed. As a first step, let's condense all this down into a
wishlist of sorts.

### Outline

- promotion between envs (`a1de838` on staging replaces `a1de838` on prod)

- zero downtime deploys

- one click rollback

  - for config and version changes
  - can mark deployments as no-rollback allowed, like backwards incompatible
    database changes

- release phase

  - run container or similar before rolling out new version

- config

  - separate config for each environment
  - deploy on config changes
  - record config changes in audit log

- logs

  - tail-able via CLI
  - historical logs as well

- metrics

  - UI with graphs around usage, CPU, Memory, etc.
  - alerting off of metrics

- process utils, `ps:exec`, `ps:kill`, `run`

  - essentially be able to ssh into a box

- audit log

  - config changes
  - deployments
  - include user responsible
  - links to rollback changes

- health & readiness checks

- all UI features available via CLI & API as well

  - webhooks

### Piggybacking of Existing Services

I think a decent solution for a Better Heroku (BH) is to wrap AWS, GCP,
etc.

Metrics, logs, and alerts could be provided by third party services
(CloudWatch, Grafana, and similar), but they'd ideally be integrated
into the BH dashboard.

Config could also be backed by an existing service, such AWS secrets, and
then surfaced via the UI, CLI, and API.

Health and readiness checks could be configured and actually used by a load
balancer.

Release phase and similar would be initiated via BH and run on a
cloud provider.

I think for the process utils to work, we'd need to run `ssh` inside the
containers.

Audit log, release flow, deploys, rollbacks would all be managed by BH.

### Prior Art

Heroku isn't the only game in town, turns out a number of places have the
same problem.

#### Interal Deploy Tools

- Github's ChatOps setup
  - <https://blog.github.com/2012-08-29-deploying-at-github/>
  - <https://github.blog/2015-06-02-deploying-branches-to-github-com/>
- <https://blog.coinbase.com/scaling-developer-productivity-d23ce491f869>
- <https://slack.engineering/deploys-at-slack-cd0d28c61701>

  - <https://news.ycombinator.com/item?id=22816645>

#### Open Source Deployment Tools

Of these, only Convox and Spinnaker seem like configurable end user products.

- <https://github.com/Shopify/shipit-engine> <!-- Feb 26, 2014 -->
- <https://spinnaker.io> <!-- Sep 7, 2014 -->
- <https://github.com/etsy/deployinator> <!-- Nov 4, 2014 -->
  - <https://codeascraft.com/2010/05/20/quantum-of-deployment/>
- <https://convox.com> <!-- Jan 15, 2015 -->
- <https://github.com/getsentry/freight> <!-- Jan 25, 2015 -->
- <https://github.com/pinterest/teletraan> <!-- Jan 13, 2016 -->
- <https://github.com/gumroad/wilfred> <!-- May 23, 2019 -->

#### Commercial Offerings

- <https://docs.aws.amazon.com/codedeploy/>
- <https://www.sleuth.io>
- <https://relizahub.com>

Instead of building another tool, maybe Convox or Spinnaker could suffice as
a next step after using Heroku, but they don't provide the same integrated
platform as Heroku.

## Wrapping Up

Heroku is decent, so any replacement needs to be signifcantly better; cheaper
and more powerful.

Much like Heroku using AWS, I think BH should be built on existing cloud
providers and services. A major benifit of Heroku is how seemless it is to
setup, deploy, and scale a project. Replicating this ease of use is important,
otherwise you risk exposing the complexity that Heroku hides to the end user.
