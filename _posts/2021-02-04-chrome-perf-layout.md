---
layout: post
title: Debugging a Chrome Performance Bug
description: A lesson in measuring
date: 2021-02-04
---

> Note: This Chrome issue happened almost a year ago now but I never got around
> to writing it up; better late than never.

The story begins with a chat page we develop at work. We started receiving
customer reports that writing a message was painfully slow, even on a beefy
machine.

The chat page was known to have existing performance issues, mainly around
short polling causing a lot of re-renders, so I assumed the issue was going to
be a JS related performance bug.

I reproduced the issue and determined it was Chrome specific -- the
performance was so bad the chat was unusable.

I had some initial assumptions of what the cause might be: either the
aforementioned polling or the text area's event handler being slow. I disabled
the polling and swapped out the text area component for a plain `<textarea/>`
without any JS hooked up, but the performance issue remained.

With my hunches exhausted, it was time for the profilers.

The [React
profiler](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
didn't indicate anything being slow so I gave the [Chrome dev tools performance
tab](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/reference)
a shot and everything became clear.

Each key down event was taking 100-300ms with 90% of the time being spent in
[layout](https://developers.google.com/web/tools/chrome-devtools/rendering-tools/#layout):

![chrome profile w/ layout](/assets/chrome-profiler-layout.png)

Meanwhile Firefox was spending 10ms in layout for the same page:

![firefox profile w/ layout](/assets/firefox-profiler-layout.png)

So layout was taking a while, but to figure out the cause I needed a minimal
reproducible example. I removed all the JS and most of the CSS and HTML from
the page, leaving me [8K of HTML with CSS inlined via a `<style/>`
tag](https://bugs.chromium.org/p/chromium/issues/attachmentText?aid=439391).

The minimal example no longer felt slow when typing, but there was still a
dramatic difference when comparing the layout speeds in Chrome and Firefox via their
respective profilers.

[I filed a bug with
Chrome](https://bugs.chromium.org/p/chromium/issues/detail?id=1065419), but we
can't just wait for the browser to release a fix, so I ended up fiddling with
the CSS until I had a workaround that kept the same design without hitting the
perf bug.

Code change was minimal, removing a `height: 100%` property from the CSS did
the trick.

## prevention

How could we have avoided the issue?

e2e test probably wouldn't work because they're usual stuck to some older
browser version and don't typically measure how long it takes to type in a
specific input.

Instead of being preventative we could try being reactive.
If we had a performance monitoring tool reporting on extra long key presses, we
could alert on regressions.

## conclusion

Having a gut feeling about what's causing a bug is useful, but keep in
mind the tools at your disposal, the browser dev tools in particular are quite
powerful.

Also workarounds are often quicker than waiting on a third party.
The Chrome issue I reported wasn't fixed until 2 months later [on July 28,
2020](https://bugs.chromium.org/p/chromium/issues/detail?id=1063575#c30).
