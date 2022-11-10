---
layout: post
title: Cutting Peak CPU in Half By Caching SSL Context
description: A little py-spy goes a long way
---

`httpx` is great, but [it has a long standing issue](https://github.com/encode/httpx/issues/838) where it doesn't cache ssl context. This is fine if you aren't creating a lot of clients, but for various reasons, [Kodiak](https://kodiakhq.com) [creates a ton of http clients](https://github.com/chdsbd/kodiak/blob/master/bot/kodiak/queries/__init__.py#L834).

## Narrowing in on the fix

First step is creating a simple test case that we can run reliably to reproduce the issue:

```python
import asyncio
import httpx

async def main() -> None:
    for _ in range(0, 10_000):
        async with httpx.AsyncClient() as client:
            r = await client.get("https://example.com")
            print(r.status_code)

if __name__ == '__main__':
    asyncio.run(main())
```

And then we can start it up and run `py-spy` on it:

![httpx ssl context creation before](/assets/httpx-ssl-pyspy-before.svg)

Which clearly shows `load_ssl_context_verify` is taking up a large portion of the trace.

If we remove the actual network calls, and instead just instantiate the client:

```python
import asyncio
import httpx
import ssl


async def main() -> None:
    while True:
        async with httpx.AsyncClient() as client:
            print("foo")

if __name__ == '__main__':
    asyncio.run(main())
```

Then the issue is even more pronounced:

![httpx ssl context creation before no network](/assets/httpx-ssl-pyspy-before-no-network.svg)

## The Fix

The proper fix is to update `httpx` to cache the [ssl context](https://docs.python.org/3/library/ssl.html#ssl.SSLContext), but as a quick workaround in the meantime, looking around in the innards of `load_ssl_context_verify` reveals there's an early return path that's used when `verify` is passed into the client's `__init__`.

Here's the code updated with the `verify` argument:

```python
import asyncio
import httpx
import ssl

# "cache" at module level
context = ssl.create_default_context()

async def main() -> None:
    while True:
        async with httpx.AsyncClient(verify=context) as client:
            print("foo")

if __name__ == '__main__':
    asyncio.run(main())
```

```python
import asyncio
import httpx
import ssl

URL = "https://example.com"

# "cache" at module level
context = ssl.create_default_context()

async def main() -> None:
    while True:
        async with httpx.AsyncClient(verify=context) as client:
            r = await client.get(URL)
            print(r.status_code)

if __name__ == '__main__':
    asyncio.run(main())
```

## The final results

HTTP calls before

![httpx client creation with network calls before the fix](/assets/httpx-ssl-pyspy-before.svg)

HTTP calls after
![httpx client creation with network calls after the fix](/assets/httpx-ssl-pyspy-after.svg)

HTTP client creation before
![httpx client creation flamegraph before the fix](/assets/httpx-ssl-pyspy-before-no-network.svg)

HTTP client creation after
![httpx client creation flamegraph after the fix](/assets/httpx-ssl-pyspy-after-no-network.svg)

And finally, after rolling out [the change](https://github.com/chdsbd/kodiak/pull/852) to Kodiak's production servers, we see the 50% drop in peak usage:

![digital ocean cpu utilization graph after showing 50% reduction in peak usage](/assets/httpx-perf-graph.png)
