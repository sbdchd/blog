---
layout: post
title: "Dates and Datetimes in JSON APIs"
description: "ISO 8601"
---

JSON doesn’t have a native type to express `date`s and `datetime`s, you only get:

- String
- Number
- Array
- Object
- Boolean
- Null

So when serializing a `datetime` to JSON, we have a choice to make.

## Unix Timestamp

We could use a unix timestamp, which fits in JSON's Number type, but reading the raw timestamp is annoying, you have to plug it into another tool to make sense of it.

## Datetime Strings

We could also serialize to a string using [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)

So:

```python
date(2024, 1, 18)
```

becomes:

```json
"2024-01-18"
```

And

```python
datetime(2024, 1, 18, 23, 22, 20, 873446, tzinfo=timezone.utc)
```

becomes

```json
"2024-01-18T23:22:20.873446+00:00Z"
```

## Caveats

### Parsing ISO 8601 Dates

When parsing a date string in JS land you’ll want to use [`parseISO`](https://date-fns.org/v3.2.0/docs/parseISO) from [`date-fns`](https://github.com/date-fns/date-fns) instead of just passing it to a `Date` constructor.

```js
parseISO("2024-01-18")
```

gives:

```
Thu Jan 18 2024 00:00:00 GMT-0500 (Eastern Standard Time)
```

While:

```js
new Date("2024-01-18")
```

gives:

```
Wed Jan 17 2024 19:00:00 GMT-0500 (Eastern Standard Time)
```

Which isn’t want you want!

### Parsing ISO 8601 Datetimes

The Date constructor in JS works out of the box for datetimes, just be mindful of time zones

## Sorting

In addition to being human readable, ISO 8601 strings are lexicographically sortable!

## Conclusion

Use ISO 8601 for serializing dates, times, datetimes, durations (like Python's `timedelta`) in JSON.
