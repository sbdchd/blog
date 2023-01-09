---
layout: post
title: "Backwards Compatible API Changes"
description: "What is safe to merge?"
---

When making a change to an API or Database Schema, by default most changes
aren't backwards compatible (safe) with previous client versions.

For example:

| change                         | safe for API Responses?                        | safe for API Requests?                    | safe for Database Schema?                         |
| ------------------------------ | ---------------------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| add required field             | ✅<br/> prev clients ignore when deserializing | ❌<br/> prev clients won't send it        | ❌<br/> prev client won't create with it          |
| add optional field             | ✅<br/> prev clients ignore when deserializing | ✅<br/> prev clients won't send it        | ✅<br/> prev clients won't create with it         |
| rename field                   | ❌<br/> prev clients expect prev name          | ❌<br/> prev clients send prev name       | ❌<br/> prev clients fetch/create prev name       |
| delete field                   | ❌<br/> prev clients expect field              | ❌<br/> prev clients send field           | ❌<br/> prev clients fetch/create prev field      |
| change field type              | ❌<br/> prev clients expect prev field type    | ❌<br/> prev clients send prev field type | ❌<br/> prev clients fetch/create prev field type |
| change null field to non-null  | ✅<br/> prev clients still deserialize         | ❌<br/> prev clients send null value      | ❌<br/> prev clients create with null             |
| add variant to enum/union      | ❌<br/> prev clients get error deserializing   | ✅<br/> prev clients send subset          | ❌<br/> prev clients fetch not expecting variant  |
| remove variant from enum/union | ✅<br/> prev clients deserialize subset        | ❌<br/> prev clients send removed variant | ❌<br/> prev clients send removed variant         |

## Making Changes Compatible

**add required field**

1. Make field nullable
2. Update all clients to send value
3. Make field required

**rename field**

1. Create new field (synced to prev field, dual writes?)
2. Update all clients to use new field
3. Remove prev field

**delete field**

1. Delete from all clients
2. Remove field

**change field type**

1. Create new field with new type (and synced, assuming field type change is compatible, i.e., `varchar` -> `text`)
2. Update all clients to use new field
3. Remove prev field

**change null field to non-null**

Add default for the field (for null case)

or

1. Update all clients to send value
2. Change field nullability

**add variant to enum/union**

- Serialze enum/union as wider type, like a `string` instead of a union of `string` literals (`"ok" | "error" | "pending"`)

or

- Update clients to support deserializing unknown values, like io-ts' [`withFallback`](https://gcanti.github.io/io-ts-types/modules/withFallback.ts.html).
  Related post with further discussion, [Exhaustiveness Checking](/2019/09/15/exhaustiveness-checking/)

**remove variant from enum/union**

1. Create new field (synced to prev field but w/o new variant)
2. Update all clients to use new field
3. Remove prev field

## Related Tools

- [openapi-diff](https://github.com/Azure/openapi-diff) check for breaking changes in Open API spec
- [apollo schema checks](https://www.apollographql.com/docs/graphos/delivery/schema-checks/) check for breaking changes in graphql schema
- [planetscale](https://planetscale.com/blog/safely-dropping-mysql-tables) check for breaking MySQL schema changes using usage data
- [squawk](https://github.com/sbdchd/squawk) check for breaking changes in Postgres schema
- [buf](https://docs.buf.build/breaking/rules) check for breaking changes in Protobuf

## Conclusion

Be careful changing your API, there are some tools to make it easier!

In general, most API changes are multi-step (and can't be made in a single PR).

1. make setup change
2. update all clients (takes a while)
3. make desired change
