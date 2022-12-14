---
layout: post
title: "Free Tier Hosted Postgres Comparision"
description: Free Trials and Actual Free Tiers
---

There are a lot of providers that offer free VMs, storage, etc., but not many that offer free, managed Postgres hosting.

## Free Tiers

| Name                                                                          | Compute | Memory | Storage | Connections             | Automatic Backups |
| ----------------------------------------------------------------------------- | ------- | ------ | ------- | ----------------------- | ----------------- |
| [neon.tech](https://neon.tech/docs/introduction/technical-preview-free-tier/) | 3 vCPU  | 4 GB   | 3GB     | 1000 w/ pooler, 100 w/o | ❌                |
| [supabase](https://supabase.com/pricing)                                      | 2 vCPU  | 1 GB   | 500MB   | 50 w/ pooler, 10 w/o    | ❌                |

For automated backups, you could always setup your own on of the numerous free tier VM offerings.

## Trials

Some providers advertise free tiers, but they're time limited so really they're free trials.

- [Render](https://render.com/docs/free#free-postgresql-databases): advertises free tier Postgres, but it expires after 90 days.

- [AWS RDS](https://aws.amazon.com/rds/free/): advertises a generous free tier offering but it expires after 1 year.
