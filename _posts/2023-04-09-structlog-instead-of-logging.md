---
layout: post
title: "Abandoning logging for structlog"
description: "Structured logs for greater good"
---

The [standard library's `logging` package](https://docs.python.org/3/library/logging.html) is the default in the Python ecosystem. It works but it isn't great. Setup is annoying:

```python
import logging
logger = logging.getLogger(__name__)
# ...
logger.info("request method=%s", method)
```

The default formatting isn't easy to parse and it doesn't support structured logs.

[`structlog`](https://www.structlog.org/en/stable/why.html) is a better choice!

## Some of the benefits

### nice default formatting

![structlog default output](/assets/structlog-default-fmt.png)

And you [can also use](https://www.structlog.org/en/stable/api.html#structlog.processors.LogfmtRenderer) [`logfmt`](https://brandur.org/logfmt) in prod which most logging providers will parse automatically. Much better than having to look at json logs.

### structured logs

You don't have to munge a bunch of strings together yourself. No dealing with, "should I use `%s` or `%d`?"

So instead of:

```python
log.info("processing item itemid=%s from queue request_id=%d", item_id, request_id)
```

we can:

```python
log.info("processing item from queue", itemid=item_id, request_id=request_id)
```

or with `bind`:

```python
log = log.bind(item_id=item_id)
log.info("processing item from queue")
```

### bind

You can build up context that gets shared with future log calls [by calling `.bind`](https://www.structlog.org/en/stable/bound-loggers.html#step-by-step-example) with your log params.

```python
log.info("starting up...")

user = get_user(request)

log = log.bind(user_id=user.id)

log.info("fetched user")

item = pop_from_queue(request)

log = log.bind(item_id=item.id)
log.info("processing item")

res = process_queue_item(item)

if not res.ok:
    log.warning("failed to process item")
```

which results in the following when using the `logfmt` renderer:

```
event="starting up..."
event="fetched user" user_id=usr_123
event="processing item" item_id=item_123 user_id=usr_123
event="failed to process item" item_id=item_123 user_id=usr_123
```

Structlog also [integrates with `ContextVars`](https://www.structlog.org/en/stable/contextvars.html) and supports [setting up](https://github.com/chdsbd/kodiak/blob/master/bot/kodiak/logging.py#L144) [`processors`](https://www.structlog.org/en/stable/processors.html) to munge your logs before they get written.

## Conclusion

Use [`structlog`](https://www.structlog.org/en/stable/index.html) for logging in Python.
