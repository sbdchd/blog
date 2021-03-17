---
layout: post
title: "Avoiding Another TypeScript Compiler Bug with ESLint"
description: ESLint FTW
date: 2020-04-15
---

So you're working away on your TypeScript based project and you have a
`switch` statement with some `case`s, which TypeScript is happy with, but
there's a problem!

```typescript
function reducer(
  state: {},
  action: { type: string; payload: { data: string } }
) {
  switch (action.type) {
    case "auth/login":
      const { data } = action.payload
      // probably update state with data
      return state
    case "page/navigation":
      console.log(data)
      // no error with ^
      return state
    default:
      return state
  }
}

reducer({}, { type: "page/navigation", payload: { data: "hello" } })
```

When we compile the code to JavaScript and run it we get a `ReferenceError`:

```javascript
❯ node
Welcome to Node.js v12.4.0.
Type ".help" for more information.
> function reducer(
...   state,
...   action
... ) {
...   switch (action.type) {
.....     case "auth/login":
.....       const { data } = action.payload
.....       // probably update state with data
.....       return state
.....     case "page/navigation":
.....       console.log(data)
.....       // no error with ^
.....       return state
.....     default:
.....       return state
.....   }
... }
undefined
>
> reducer({}, { type: "page/navigation", payload: { data: "hello" } })
Thrown:
ReferenceError: Cannot access 'data' before initialization
    at reducer (repl:11:19)
>
```

Yikes! TypeScript should have caught that.

Turns out there is already a bug ticket for this,
<https://github.com/microsoft/TypeScript/issues/19503>, but how can we avoid
this bug from biting us until it's fixed?

A lint of course.

Essentially we want a lint that enforces all case statements use blocks,
which TypeScript handles properly.

The "correct" code with the lint would be:

```typescript
function reducer(
  state: {},
  action: { type: string; payload: { data: string } }
) {
  switch (action.type) {
    case "auth/login": {
      const { data } = action.payload
      return state
    }
    case "page/navigation": {
      console.log(data)
      //          ^^^^
      // Cannot find name 'data'. (2304)
      return state
    }
    default:
      return state
  }
}

reducer({}, { type: "page/navigation", payload: { data: "hello" } })
```

ESLint's
[`no-case-declarations`](https://eslint.org/docs/rules/no-case-declarations)
rule is pretty similar to our desired behavior and is in fact more advanced
since it only requires the block when there are declarations in the case
statement.

**TL;DR**: enable
[`no-case-declarations`](https://eslint.org/docs/rules/no-case-declarations)
in your ESLint config until the [TypeScript
bug](https://github.com/microsoft/TypeScript/issues/19503) is fixed.
