---
layout: post
date: 2019-06-13
title: "Unclogging an Asyncio Event Loop"
---

Calling normal, synchronous functions from [`asyncio`](https://docs.python.org/3/library/asyncio.html) code is pretty straightforward, either it is fast enough to not block the event loop or it should
be moved to a [thread executor](https://docs.python.org/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor) and awaited.

If a function blocks the event loop for too long, the default is 100ms set by
[`loop.slow_callback_duration`](https://docs.python.org/3/library/asyncio-dev.html),
and asyncio `DEBUG` is enabled, then asyncio will produce an error like:

```python
WARNING:asyncio:Executing <Handle <TaskWakeupMethWrapper object at 0x102b727c8> created at /usr/local/Cellar/python/3.7.2_2/Frameworks/Python.framework/Versions/3.7/lib/python3.7/asyncio/streams.py:408> took 0.130 seconds
```

Which sadly doesn't point to which function is too slow.

Now for this case in particular, at 130ms it seems like it could be a
synchronous network call, but, spoiler, it isn't.

To actually find the clog, we can utilize CPython's provided [CProfile](https://docs.python.org/3/library/profile.html#module-cProfile).

Some quick background, the app in question is a web server with a few Redis
queues and workers for those Redis queues.

We run it as follows:

```sh
poetry run uvicorn kodiak.main:app
```

For those who would like to following along at home, you can download the
[version with this bug at
GitHub](https://github.com/chdsbd/kodiak/tree/48007d2b4fc4f11e5924a9fdf1a6a0e925dbf667).
Beware that actually setting up the app is kind of a pain.

When running the app we won't actually see any warnings, until we enable asyncio debug mode.

Easy enough.

```sh
PYTHONASYNCIODEBUG=1 poetry run uvicorn kodiak.main:app
```

Now, after receiving some HTTP requests we should get some of the warnings.

## Using cProfile

To actually locate the slow functions, we run the app with cProfile.

Now normally something like the following works, but for some reason it
doesn't output any cProfile stats. Not sure why.

```sh
TMP_FILE=$(mktemp)
APP=$(poetry run which uvicorn)
PYTHONASYNCIODEBUG=1 SECRET_KEY='92a34159-16b3-4969-8620-1af65e2b9c45' GITHUB_PRIVATE_KEY_PATH=kodiak-testing-sbd.2019-06-15.private-key.pem GITHUB_APP_ID=33138 poetry run python -m cProfile -o "$TMP_FILE" "$APP" kodiak.main:app
poetry run python ./profile_stats.py "$TMP_FILE"
```

An alternative is just wrapping any suspect functions in cProfile calls. Following [the example from the docs](https://docs.python.org/3/library/profile.html#profile.Profile) we get this:

```diff
diff --git a/kodiak/main.py b/kodiak/main.py
index 45083ea..653350d 100644
--- a/kodiak/main.py
+++ b/kodiak/main.py
@@ -73,6 +73,11 @@ async def pr_check_worker(*, webhook_event_json: BlockingZPopReply) -> None:
     check status of PR
     If PR can be merged, add to its repo's merge queue
     """
+
+    import cProfile, pstats, io
+    from pstats import SortKey
+    pr = cProfile.Profile()
+    pr.enable()
     webhook_event = WebhookEvent.parse_raw(webhook_event_json.value)
     pull_request = PR(
         owner=webhook_event.repo_owner,
@@ -82,6 +87,12 @@ async def pr_check_worker(*, webhook_event_json: BlockingZPopReply) -> None:
     )
     # trigger status updates
     m_res, event = await pull_request.mergeability()
+    pr.disable()
+    s = io.StringIO()
+    sortby = SortKey.CUMULATIVE
+    ps = pstats.Stats(pr, stream=s).sort_stats(sortby)
+    ps.print_stats()
+    print(s.getvalue())
     if event is None or m_res == MergeabilityResponse.NOT_MERGEABLE:
         return
     if m_res not in (
```

We wrap the `pull_request.mergeability()` since the method handles a a large
portion of the app's logic.

We can then run the code like normal and get an output as follows.

```
         602506 function calls (596943 primitive calls) in 0.763 seconds

   Ordered by: cumulative time

   ncalls  tottime  percall  cumtime  percall filename:lineno(function)
       19    0.000    0.000    0.688    0.036 ./kodiak/main.py:71(pr_check_worker)
       20    0.000    0.000    0.636    0.032 ./kodiak/main.py:463(mergeability)
       10    0.000    0.000    0.572    0.057 ./kodiak/main.py:428(get_event)
        5    0.000    0.000    0.537    0.107 ./kodiak/queries.py:471(get_event_info)
       30    0.000    0.000    0.511    0.017 ./kodiak/queries.py:231(get_values)
       30    0.000    0.000    0.508    0.017 /projects/kodiak/.venv/lib/python3.7/site-packages/jsonpath_rw/parser.py:13(parse)
       30    0.000    0.000    0.508    0.017 /projects/kodiak/.venv/lib/python3.7/site-packages/jsonpath_rw/parser.py:30(parse)
       30    0.003    0.000    0.508    0.017 /projects/kodiak/.venv/lib/python3.7/site-packages/jsonpath_rw/parser.py:34(parse_token_stream)
       30    0.004    0.000    0.455    0.015 /projects/kodiak/.venv/lib/python3.7/site-packages/ply/yacc.py:3216(yacc)
       30    0.001    0.000    0.365    0.012 /projects/kodiak/.venv/lib/python3.7/site-packages/ply/yacc.py:2102(__init__)
       20    0.000    0.000    0.346    0.017 ./kodiak/queries.py:235(get_value)
       30    0.063    0.002    0.330    0.011 /projects/kodiak/.venv/lib/python3.7/site-packages/ply/yacc.py:2534(lr_parse_table)
       30    0.000    0.000    0.125    0.004 /projects/kodiak/.venv/lib/python3.7/site-packages/ply/yacc.py:2510(add_lalr_lookaheads)
    29520    0.072    0.000    0.121    0.000 /projects/kodiak/.venv/lib/python3.7/site-packages/ply/yacc.py:2165(lr0_goto)
       24    0.000    0.000    0.117    0.005 /projects/kodiak/.venv/lib/python3.7/site-packages/requests_async/sessions.py:95(post)
       24    0.000    0.000    0.117    0.005 /projects/kodiak/.venv/lib/python3.7/site-packages/requests_async/sessions.py:36(request)
       30    0.014    0.000    0.111    0.004 /projects/kodiak/.venv/lib/python3.7/site-packages/ply/yacc.py:2200(lr0_items)
--snip--
```

The clog is now apparent. It was
[jsonpath_rw](https://github.com/kennknowles/python-jsonpath-rw)! Which, as
we can see in the stats, calls out to [ply](https://github.com/dabeaz/ply), a
Python implementation of [yacc](https://en.wikipedia.org/wiki/Yacc).

A quick search of jsonpath_rw's code reveals that it [regenerates its yacc
parse table on each call and has a
comment](https://github.com/kennknowles/python-jsonpath-rw/blob/f615451d7b405e23e0f80b15cad03b1427b0256d/jsonpath_rw/parser.py#L46-L53)
noting that, "it doesn't actually take long!". Sadly the definition for too
long in the event loop is different.

So long jsonpath_rw. Hello unclogged event loop.
