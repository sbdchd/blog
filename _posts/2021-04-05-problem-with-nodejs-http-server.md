---
layout: post
title: "What Node.js' HTTP server gets wrong"
description: Or, how CPS isn't user friendly
date: 2021-04-07
---

If you're writing an HTTP server in Node, you probably won't use the standard
library's `http.Server` directly, instead you'll use one of the many libraries
that wrap it, like:

- [Express](http://expressjs.com/en/starter/hello-world.html)
- [Restify](http://restify.com/docs/home/)
- [Koa](https://koajs.com/)
- [Next.js](https://nextjs.org/docs/api-routes/introduction)
- [Hapi](https://hapi.dev/tutorials/routing/?lang=en_US)
- [NestJS](https://docs.nestjs.com/controllers)
- [Sails](https://sailsjs.com/documentation/concepts/actions-and-controllers)
- [Adonis](https://adonisjs.com/docs/4.1/request-lifecycle#_http_context)

All of these libraries, except for `Hapi` and `NestJS`, use a [CPS
API](https://en.wikipedia.org/wiki/Continuation-passing_style) for returning
responses.

Which essentially means that the type of a route handler is:

```ts
type Handler = (req: Request, res: Response) => void
```

instead of what you typically see in other languages:

```ts
type Handler = (req: Request) => Response
// or
type Handler = (req: Request) => Promise<Response>
```

## Mistakes caused by CPS

In these examples we're using `express`'s API, but the other libraries are all
pretty similar.

Let's start with a basic hello world:

```ts
const express = require("express")
const app = express()

app.get("/", (req, res) => {
  res.send("hello world")
})

app.listen(3000, () => {
  console.log("started")
})
```

Easy enough, nothing of note really.

Now let's fetch some data from the database:

```ts
const express = require("express")
const app = express()

async function getUsers(): Array<{ id: string; email: string }> {}

app.get("/", (req, res) => {
  return getUsers().then(users => res.status(200).send(users))
})

app.listen(3000, () => {
  console.log("started")
})
```

At first glance this looks fine, it passes the type checker and if you send
the server a request, you'll get the response you're expecting, but there is
a problem. If `getUsers` throws an error, there isn't anything to catch the
unhandled exception and return a `500`.

To developers unfamiliar with CPS, this example looks like any errors
will be handled by `express` since we're returning a `Promise` from the
handler, but that isn't the case, instead the request to the server will hang
on error.

We really shouldn't be returning anything from the handler, and the `express`
route handler is [typed as returning `void`][express-handler-ret-type] so why
are we able to return the `Promise` without TypeScript complaining?

## The TypeScript Connection

TypeScript is unique in that it [allows functions not returning `void`, to be
assigned to functions returning
`void`](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-returning-non-void-assignable-to-function-returning-void).

There's [an open issue](https://github.com/microsoft/TypeScript/issues/8584)
to add another flag to restrict this behavior, but for now we're stuck with
it.

To illustrate the problem, here's a minimal example with an `express` like
API:

```ts
type Req = { url: string }
type Res = {
  send: (data: string) => void
}

function createApp() {
  return {
    get: (path: string, cb: (req: Req, res: Res) => void): void => {}
  }
}

const app = createApp()

app.get("/", (req, res) => {
  return "hello world"
})
```

For those unfamiliar with CPS, they might think this endpoint returns the
string `hello world`, but as we've seen above, that's not the case.

### TypeScript

[Running this in TypeScript][typescript-playground] we don't any errors or warnings.

### Flow

If we [try it with Flow](https://flow.org/try/) we get the following errors:

```
15:   return "hello world"
             ^ Cannot call `app.get` with function bound to `cb` because string [1] is incompatible with undefined [2] in the return value. [incompatible-call]
References:
15:   return "hello world"
             ^ [1]
8:     get: (path: string, cb: (req: Req, res: Res) => void): void => {}
                                                       ^ [2]
```

### Python

And for kicks let's see what [`mypy`](https://github.com/python/mypy) and [`pyright`](https://github.com/microsoft/pyright) have to say:

```python
from typing import Callable

def foo(cb: Callable[[], None]) -> None:
    ...

def bar() -> int:
    ...

foo(bar)
```

`mypy`:

```
 main.py:9:5: error: Argument 1 to "foo" has incompatible type "Callable[[], int]"; expected "Callable[[], None]"  [arg-type]
```

`pyright`:

```
~/project/main.py
  ~/project/main.py:9:5 - error: Argument of type "() -> int" cannot be assigned to parameter "cb" of type "() -> None" in function "foo"
    Type "() -> int" cannot be assigned to type "() -> None"
      Function return type "int" is incompatible with type "None"
        Cannot assign to "None" (reportGeneralTypeIssues)
```

So `flow`, `mypy`, and `pyright` complain about the types, but TypeScript doesn't.

## Conclusion

CPS HTTP servers don't play well with `Promise`s resulting in unintuitive
behavior and TypeScript can offer little help.

[typescript-playground]: https://www.typescriptlang.org/play?#code/C4TwDgpgBAShCOUC8UDeUCuAnANgLigGdgsBLAOwHMoBfAKFElgkOTTqiInIBMCAKHgENgQgsTJUAlMgB8UAG4B7Ujzr06AMwzkAxsFJLyUXVggiIAQTBh+M1Byhng2Yw86dKEYALAiAFuIkFJQANCYARgJm8ARw8OFmhHEsMkjyyqpSBJk8cmj0nPQaukbEUEI2bKbmwFY2dnR0lWAAdF7A-ABEAPRd4fwxian57k7erlBd-hA4OEpQAO5KuDxd6lJAAw
[express-handler-ret-type]: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c558a541b90dc2b30541bb86bcef88fd334121e2/types/express-serve-static-core/index.d.ts#L70
