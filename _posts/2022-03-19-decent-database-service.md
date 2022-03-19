---
layout: post
title: A Decent Database Service
description: "Lots of features required"
---

For inspiration, we can look to Heroku, Mongo Atlas, Planetscale, and EdgeDB.

## Features

### Administration

- easy one-click database creation

- auto scaling

  - should also be zero downtime

    Heroku's process is [pretty manual and involves downtime](https://devcenter.heroku.com/articles/upgrading-heroku-postgres-databases#upgrading-with-pg-upgrade-2-enter-maintenance-mode-to-prevent-database-writes). Mongo Atlas is hands-off, but likes to [drop in flight connections / requests](https://github.com/mongodb/mongo-python-driver/blob/da81c69644a3d8245c4b60a92d9ce39ff0a2e8ba/pymongo/errors.py#L60) when the shard fails over. Planetscale's pricing/usage model is supposed to avoid the scaling hassle. Spanner is also supposed to just work.

  - shouldn't have to worry about running your own [connection pooler](https://github.com/pgbouncer/pgbouncer)

- easy metrics UI like Heroku / Mongo Atlas with builtin alerting

  Heroku does a good job surfacing metrics for dynos, but less so with Postgres. Atlas does great job with their metrics UI.

  Another important part is alerting, specifically alerting on:

  - long running queries
  - IOPS
  - CPU load
  - storage usage

  The UI should also allow blocking/killing specific queries:

  - For Mongo, this is important as you can't set a max query timeout at the database level, each connection needs to [specify the `maxTimeMS`](https://docs.mongodb.com/manual/reference/method/cursor.maxTimeMS/#mongodb-method-cursor.maxTimeMS).

- index recommendations

  Related to metrics, but the database should provide recommendations around indexes to add to speed up queries and unused indexes that can be removed. Atlas does a good job [with their Performance Advisor](https://docs.atlas.mongodb.com/performance-advisor/#index-suggestions). Heroku has a couple views for top CPU usage and top IO by query which is also helpful.

- UI for querying and editing data

  After creating your database, using the web UI to also create, edit, and query data is super useful. Mongo Atlas has a decent web UI that handles most of the usage patterns. Planetscale doesn't have this and [recommends using third party database clients](https://planetscale.com/blog/planetscale-free-sql-gui-with-arctype).

### Syncing

An ideal database service would have integrated data warehousing and search (Elastic and similar). Postgres has full text search builtin, but it comes with caveats, like needing to pull all the matched rows from disk in order to run ranking, which is [noted in the docs](https://www.postgresql.org/docs/12/textsearch-controls.html#TEXTSEARCH-RANKING):

> Ranking can be expensive since it requires consulting the `tsvector` of each
> matching document, which can be I/O bound and therefore slow. Unfortunately, it
> is almost impossible to avoid since practical queries often result in large
> numbers of matches.

Mongo Atlas [provides a service](https://docs.atlas.mongodb.com/atlas-search/) for syncing your database to a Lucene based search db, and while it's hands-off, it isn't the same as using off the shelf Elastic.

### Developer Experience

The day to day usage of the database, from a developer standpoint, should be nice.

Having a decent query language / ORM is huge benifit

- Mongo has [great client libraries](https://pymongo.readthedocs.io/en/stable/index.html), easier to use than concatenating some SQL strings
- EdgeDB has a [fancy TypeScript query builder](https://github.com/edgedb/edgedb-js)
- Postgres has a ton of features for querying and its JSON support is top notch.

Database migrations need to be easy

- zero downtime, online schema migrations

  With default Postgres and some linters, you can get low downtime, but zero downtime requires a lot of work. Planetscale has it for free. Mongo side steps the affair by not having any schema.

Need proper schema

- When you're building a rich application, you want a schema to properly model your data and enforce constraints. The database should be closer to Postgres / MySQL, not MongoDB.

Transactions

- Essential for some workloads and handy for almost any use case.

Excellent docs

- Mongo and Postgres both have great docs, which makes it much easier to get started and debug issues.

Support

- being able to ask the hosting provider what the hell happened is nice
- okay if it’s an up charge

## Conclusion

There are a lot of features required to make a great developer experience, and there's probably a few that have been overlooked.
