---
layout: post
title: Pesky Globals, Even with TypeScript
date: 2020-07-24
---

There are a lot of globals in JS land:

<https://developer.mozilla.org/en-US/docs/Web/API/Window>

Many of these globals have verbose / unusual names meaning you won't
enounter them when writing your application code.

But there are a handful of sneaky ones.

## annoying globals

- [`close`](https://developer.mozilla.org/en-US/docs/Web/API/Window/close): `() => void`

  fits nicely into React components as an event handler

- [`closed`](https://developer.mozilla.org/en-US/docs/Web/API/Window/closed): `boolean`

- [`status`](https://developer.mozilla.org/en-US/docs/Web/API/Window/status): `string`

  if your using a union of string literals with name `status`, comparisions in
  code will still be valid against `window.status`

- [`name`](https://developer.mozilla.org/en-US/docs/Web/API/Window/name): `never`

  problematic as `never` is compatible with _every_ type

- [`length`](https://developer.mozilla.org/en-US/docs/Web/API/Window/length): `number`
- [`origin`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/origin): `string`
- [`event`](https://developer.mozilla.org/en-US/docs/Web/API/Window/event): `Event | undefined`

  not too big of an issue in React land because `React.ChangeEvent` isn't compatible.

## the fix: eslint

- <https://eslint.org/docs/rules/no-restricted-globals>

```js
"no-restricted-globals": [
  "error",
  "close",
  "closed",
  "status",
  "name",
  "length",
  "origin",
  "event",
],
```

### What if I want to use one of those globals?

Don't worry, you can access the property from `window` and the lint rule won't complain. e.g. `window.status`
