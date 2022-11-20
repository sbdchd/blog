---
layout: post
title: "zero to connection string"
description: it's a race!
---

After completely failing to get postgres spanner setup I thought I'd compare how easy other platforms made it.

Some ground rules, I don't include the time it takes to signup and login, and just getting a connection string isn't enough, I have to be able to run a `select 1;`.

Also I recorded videos for all of these setups but they were boring so I didn't include them.

| name                                                                                        | time (sec) | time (mins) | notes                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------- | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Neon](https://neon.tech)                                                                   | 9          | < 1         | Although I couldn’t use table plus with the provided connection string, had to use `psql $connection-string`                                                                                                                                                                                                                    |
| [Heroku Postgres](https://www.heroku.com/postgres)                                          | 26         | < 1         |
| [Render Postgres](https://render.com/docs/databases)                                        | 57         | < 1         |
| [Planetscale](https://planetscale.com)                                                      | 103        | 2           |
| [Cockroach DB](https://www.cockroachlabs.com)                                               | 162        | 3           | Couldn’t get TablePlus to work with their encryption stuff, used psql instead                                                                                                                                                                                                                                                   |
| [Supabase](https://supabase.com/database)                                                   | 171        | 3           |
| [DigitalOcean Postgres](https://www.digitalocean.com/products/managed-databases-postgresql) | 242        | 4           |
| [Mongo](https://www.mongodb.com)                                                            | 277        | 5           | TablePlus didn’t work so ended up having to download mongosh                                                                                                                                                                                                                                                                    |
| [Crunchydata Postgres](https://www.crunchydata.com)                                         | 600        | 10          |
| [Yugabyte](https://www.yugabyte.com)                                                        | 719        | 12          |
| [Google Cloud Postgres](https://cloud.google.com/sql/docs/postgres)                         | 765        | 13          | A little trouble [exposing the instance](https://cloud.google.com/sql/docs/postgres/connect-admin-ip) to the world, but [got there](https://cloud.google.com/sql/docs/postgres/connect-admin-ip#connect).                                                                                                                       |
| [Amazon RDS](https://aws.amazon.com/rds/postgresql/)                                        | 1973       | 33          | Spent a ton of time messing with [security groups](https://stackoverflow.com/questions/66641094/aws-security-group-meaning-of-port-0-in-custom-tcp-rule) and database [visibility settings](https://stackoverflow.com/questions/37212945/aws-cant-connect-to-rds-database-from-my-machine) to actually connect to the database. |
| [Cloud Spanner Postgres](https://cloud.google.com/spanner/docs/postgresql-interface)        | DNF        | DNF         | Gave up after 1 hour of trying. Running the postgres java converter thing was annoying but auth was a complete nightmare.                                                                                                                                                                                                       |

## Notes

Some providers make auth setup way harder than it needs to be.

Lots of UIs made it difficult to copy the connection string text from the UI due to [text selection issues](/2022/11/19/cursor-pointer-user-select-none/).

Other sites only had bits and pieces of the connection params, so you have to play detective.

And finally, if you have a "setting up your database" status message in your UI, I shouldn't refresh the page to see the database is ready and that the polling interval was too infrequent to notice.

Overall, there are a lot of easy to use offerings available!
