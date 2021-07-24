---
layout: post
title: Beware of Array Spread
description: hitting the limits of the call stack
date: 2021-07-24
---

Let's say you're pulling ids from a database in batches and you want to combine
these
batches into one big array.

One approach might use spread with [`Array::push`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push):

```ts
const allUserIds: string[] = []

for await (const batchUserIds of getUserIds()) {
  allUserIds.push(...batchUserIds)
}

// use allUserIds
```

But there's a problem, if `batchUserIds` is too long, JS will raise a [`RangeError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError)!

The max number of arguments, and in turn the max length of `batchUserIds`, depends on the JS implementation.

- JavaScriptCore (Safari): max of [65,537 arguments](https://bugs.webkit.org/show_bug.cgi?id=80797)
- SpiderMonkey (Firefox): max of [500,000 arguments](https://github.com/mozilla/gecko-dev/blob/d36cf98aa85f24ceefd07521b3d16b9edd2abcb7/js/src/vm/ArgumentsObject.h#L98)
- V8 (Chrome, Node): [depends on stack size](https://source.chromium.org/chromium/chromium/src/+/main:v8/src/execution/isolate.h;l=2351-2364?q=StackLimitCheck&ss=chromium)

So there are somewhat abitrary limits that depend on the browser, which [MDN warns about](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply#using_apply_and_built-in_functions).

MDN is also kind enough to offer a solution, use smaller chunks when using `.apply` or `...` (spread).

And if we update our code with a little help from [Lodash's `chunk`](https://lodash.com/docs#chunk):

```ts
const MAX_JS_ARGS = 65_537
const MAX_SPREAD_BATCH_SIZE = Math.floor(MAX_JS_ARGS / 2)

const allUserIds: string[] = []

for await (const batchUserIds of getUserIds()) {
  chunk(batchUserIds, MAX_SPREAD_BATCH_SIZE).forEach(subBatch => {
    allUserIds.push(...subBatch)
  })
}

// use allUserIds
```

No more `RangeError`!

TL;DR: watch out for large arrays when spreading
