---
layout: post
title: HTTP Timeouts
description: Setting an overall timeout in various languages
---

Recently as part of [adding a scraper to
recipeyak](https://github.com/recipeyak/recipeyak/commit/7e98109eb9b68e648c7260dddb287ef5ccb4f8e1)
I was investigating the various bits and pieces necessary to make the outbound
network requests secure, e.g. how to avoid SSRF and other badness.

Webhooks.fyi has [a nice
overview](https://webhooks.fyi/best-practices/webhook-providers) of the various
footguns and while proxying the outbound requests through [Stripe's
Smokescreen](https://github.com/stripe/smokescreen) would fix the problem, I
wanted to avoid an extra service and it seemed fun to DIY it. Also it's just a
hobby project so the risk is low.

I got most things covered, but I wasn't able to solve HTTP request timeouts.
Specifically overall timeouts, with Python's `requests` package you can set
`connect` and `read` timeouts but you can't say "kill this request if it takes more
than 5 seconds".

This means when using `requests` for outbound HTTP calls, an attacker could
perform a slow loris style attack where they send you a trickle of bytes over
the network which prevents the `connect` timeout and `read` timeout from firing
and hold up your request.

Anyways, I wanted to see how various languages solved this "total timeout" HTTP request problem.

## Golang

Smokescreen uses Go and [they use](https://github.com/stripe/smokescreen/blob/37bbae42c899afbe4139bbd8a7a9886cc3f18bcb/pkg/smokescreen/timeout_conn.go#L22) [Go's `Conn.SetDeadline`](https://pkg.go.dev/net#Conn.SetDeadline) function to set an overall timeout.

## Rust

If you're using async Rust w/ tokio, you can use Tokio's [`timeout` function](https://docs.rs/tokio/latest/tokio/time/fn.timeout.html#examples).

With sync rust, [there's more setup involved](https://stackoverflow.com/a/42720480/3720597) (you have to introduce threads into the mix) but it also works.

## Python

Like Rust, Python has both sync and async io.

For async, you can [use asyncio's `wait_for`](https://docs.python.org/3/library/asyncio-task.html#asyncio.wait_for).

With sync, I couldn't find a non-hacky solution. If you [browse stackoverflow](https://stackoverflow.com/questions/21965484/timeout-for-python-requests-get-entire-response) you'll find ideas like:

- use `signal`s -- which aren't thread safe
- use gevent -- that's jumping ship to async!
- use the connect & read timeouts -- they don't do the same thing
- use multiprocessing -- heavyweight, requires pickling

There's [an issue in the requests repo for this functionality](https://github.com/psf/requests/issues/3099), but it's unlikely to be resolved.

I also tried fiddling with concurrent futures and their `timeout=` parameter but that didn't work - the request carried on regardless of the timeout.

## Java

Java is sync, but unlike Python, it has [a decent solution](https://stackoverflow.com/a/9873902/3720597) involving the [standard library's `Future::get` method](<https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Future.html#get(long,%20java.util.concurrent.TimeUnit)>).

## JS

There are a couple options for JS, `Promise.race` and `AbortController`. [`Promise.race`
doesn't actually cancel](https://gist.github.com/davej/728b20518632d97eef1e5a13bf0d05c7) the request [while `AbortController` does](https://developer.mozilla.org/en-US/docs/Web/API/AbortController#examples).

## Ruby

I couldn't find any solutions besides the [timeout module](https://stackoverflow.com/a/31856339/3720597), which is [apparently pretty broken](http://www.mikeperham.com/2015/05/08/timeout-rubys-most-dangerous-api/).

## PHP

Pretty [straightforward solution](https://stackoverflow.com/a/7760731/3720597) with PHP, use the `CURLOPT_TIMEOUT` option with [`curl_setopt`](https://www.php.net/manual/en/function.curl-setopt.php).

## Swift

Call [`.cancel`](https://developer.apple.com/documentation/foundation/urlsessiontask/1411591-cancel) on a given [`URLSessionTask`](https://developer.apple.com/documentation/foundation/urlsessiontask) and you're all set in Swift land.
