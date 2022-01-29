---
layout: post
title: Prefix Your Env Vars
description: "Namespaces are good"
---

If you develop an app long enough, you'll probably end up with a number of env vars. You probably have some variation of `DATABASE_URL`, `CACHE_URL`, `DEFAULT_STMT_TIMEOUT`, etc.

This is fine when you only have a few env vars, but at some point it breaks down and becomes hard to figure out what each env var does / comes from.

This is why I think it's wise to prefix env vars. This serves a couple purposes, you can more easily `grep` for env vars, and it helps separate app env vars from env vars that exist on the host.

As they say:

> Namespaces are one honking great idea -- let's do more of those! <br/>-- [The Zen of Python](https://www.python.org/dev/peps/pep-0020/)
