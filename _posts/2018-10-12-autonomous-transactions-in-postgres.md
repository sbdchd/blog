---
layout: post
title: "Autonomous Transactions in Postgres"
description: By using another connection
---

At work I was developing an import feature that needed to update around 100,000
items in a transaction. Since this takes a bit to complete, I wanted to report
progress as the background import jobs ran, but I stumbled into a weird issue;
no progress updates would be reported until the job completed.

The root cause here is the import transaction. Since our progress updates are
in a transaction, we obviously won't see the update until we commit. We need to
escape the transaction and commit our progress updates while our import job
runs.

What we need is called an autonomous transaction, which allows for a child
transaction to commit inside a parent transaction, without needing the parent
to commit.

With some [brief research][so-post], it turns out that while Oracle supports
autonomous transactions, Postgres does not. Luckily, there is a simple
workaround using a separate database connection. See below for a Django
example.

```python
# settings.py
DATABASES = {
    "default": db_config,
    # The test mirror is a must for testing to behave correctly.
    # Two connections will not work with Sqlite.
    "secondary": {**db_config, "TEST": {"MIRROR": "default"}},
}
```

[so-post]: https://stackoverflow.com/a/25428060/3720597
