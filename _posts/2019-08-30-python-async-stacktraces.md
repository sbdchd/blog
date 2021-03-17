---
layout: post
date: 2019-08-30
title: "Python's Async Stack Traces"
description: Much nicer than JS
---


[Nick Fitzgerald's post on stack traces with async Rust](http://fitzgeraldnick.com/2019/08/27/async-stacks-in-rust.html) provides a great comparison between the stack traces in async Rust and in JavaScript, but how does Python compare?


## Synchronous Python

Using sync Python as a baseline, and replicating the structure of the call hierarchy seen in the post, we get:

```python
import time

def blow_up():
    time.sleep(0.3)
    raise Exception("nested error in sync code")

def bar():
    time.sleep(0.2)
    blow_up()

def foo():
    time.sleep(0.1)
    bar()

foo()
```

which gives the following stack trace when run:

```
❯ python3 looping_sync.py
Traceback (most recent call last):
  File "looping_sync.py", line 16, in <module>
    foo()
  File "looping_sync.py", line 14, in foo
    bar()
  File "looping_sync.py", line 10, in bar
    blow_up()
  File "looping_sync.py", line 6, in blow_up
    raise Exception("nested error in sync code")
Exception: nested error in sync code
```

A pretty clear stack trace which shows the call hierarchy.


## Async Python

And now we just need to convert it to async:


```python
import asyncio

async def blow_up():
    await asyncio.sleep(0.3)
    raise Exception("nested error in async code")

async def bar():
    await asyncio.sleep(0.2)
    await blow_up()

async def foo():
    await asyncio.sleep(0.1)
    await bar()

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
loop.run_until_complete(foo())
loop.close()
```

which gives the following stack trace:

```
❯ python3 looping.py
Traceback (most recent call last):
  File "looping.py", line 17, in <module>
    loop.run_until_complete(foo())
  File "/usr/local/Cellar/python/3.7.3/Frameworks/Python.framework/Versions/3.7/lib/python3.7/asyncio/base_events.py", line 584, in run_until_complete
    return future.result()
  File "looping.py", line 13, in foo
    await bar()
  File "looping.py", line 9, in bar
    await blow_up()
  File "looping.py", line 5, in blow_up
    raise Exception("nested error in async code")
Exception: nested error in async code
```

The stack trace is pretty much the same as the sync version and isn't missing any details.

Clear, useful, stack traces. All in the comfort of Python. Huzzah!

