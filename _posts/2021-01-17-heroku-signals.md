---
layout: post
title: Handling Signals in Heroku
date: 2021-01-17
---

[During dyno shutdown](https://devcenter.heroku.com/articles/dynos#shutdown)
Heroku sends `SIGTERM` to all processes on the machine, not just the ones
defined in the [`Procfile`](https://devcenter.heroku.com/articles/procfile).

This has a few consequences, if your processes do not handle `SIGTERM` as a
graceful shutdown you can't change the configured signal like you can with
`systemd`'s
[`KillSignal`](https://www.freedesktop.org/software/systemd/man/systemd.kill.html#KillSignal=)
and Docker's
[`STOPSIGNAL`](https://docs.docker.com/engine/reference/builder/#stopsignal).

So if you're running NGINX which uses `SIGQUIT` for graceful shutdown, you'll
need to [recompile NGINX with a
patch](https://github.com/heroku/heroku-buildpack-nginx/issues/31) to change
the shutdown signals. This is true even if you're using the Heroku maintained
NGINX buildpack. Celery has a similar issue with Heroku that can be
[mitigated with the `REMAP_SIGTERM` env
var](https://devcenter.heroku.com/articles/celery-heroku#using-remap_sigterm).

Additionally, by sending signals to every process on the machine, you can't
have a parent process trap and change the signals that get passed down to the
child, which would avoid the NGINX recompile. And since every process gets
`SIGTERM`ed, both parent and worker processes need to handle `SIGTERM` as
a graceful shutdown request.

Heroku's "send signals to all the processes" approach is similar to the
default [`KillMode=crontrol-group` setting described in the systemd
docs](https://www.freedesktop.org/software/systemd/man/systemd.kill.html#KillMode=).
Which works for some cases, but services like NGINX would be better off with
`KillMode=mixed` and `KillSignal=SIGQUIT`.

## Conclusion

Heroku is easy to get started with but lacks some basic configuration
settings that are helpful for robust process management.
