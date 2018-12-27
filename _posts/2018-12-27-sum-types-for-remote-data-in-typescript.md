---
layout: post
title:  "Sum Types for Remote Data in TypeScript"
---

If you've ever stumbled into the [Elm](https://elm-lang.org) community, you
may have encountered the usage of the [`Result`
type](https://guide.elm-lang.org/error_handling/result.html). Kris Jenkin's
post, [How Elm Slays a UI
Antipattern](http://blog.jenkster.com/2016/06/how-elm-slays-a-ui-antipattern.html)
provides a nice example of sum types to better define UI states.

Essentially, sum types prevent us from having to remember to check `loading`,
`updating` or similar flags before rendering data, as the data is no longer
`IData`, and is instead wrapped inside a `Success<T>` which is unioned with `Loading`,
`Updating<T>`, and additional states.

The Elm example outlined in Jenkin's post can be created in TypeScript pretty
easily, although with greater verboisty since sum types aren't as easy to
define.

First let's assume we have an equivalent type to [Elm's HttpError and Response](https://package.elm-lang.org/packages/elm-lang/http/latest/Http).

Now we define the TypeScript version of the `RemoteData` and `WebData` types.

```typescript
import { HttpError } from './http'

const enum k {
  NotAsked,
  Loading,
  Failure,
  Success
}

interface NotAsked {
  readonly kind: k.NotAsked
}

interface Loading {
  readonly kind: k.Loading
}

interface Failure<E> {
  readonly kind: k.Failure,
  readonly failure: E
}

interface Success<T> {
  readonly kind: k.Success,
  readonly data: T
}

type RemoteData<E, T> =
  | NotAsked
  | Loading
  | Failure<E>
  | Success<T>

type WebData<T> = RemoteData<HttpError, T>
```

Which we can then when defining our application state.

```typescript
interface IUser {
  readonly id: number
  readonly email: string
  readonly active: boolean
}

interface IState {
  readonly users: WebData<ReadonlyArray<IUser>>
}

export function render(): string {
  const state: IState = {
    users: { kind: k.NotAsked }
  }

  switch (state.users.kind) {
    // With strict function types turned on, we will get a compiler error
    // if we leave a case out since we define our return type as `string`.
    case k.NotAsked:
      return "You haven't fetch the users yet"
    case k.Loading:
      return "Loading..."
    case k.Failure:
      return `Uh oh! There was a failure: ${state.users.failure}`
    case k.Success:
      const emails = state.users.data.map(u => u.email)
      return "Huzzah! Users fetched." + emails.join(", ")
  }
}
```

Now our `RemoteData` has the same functionality as the Elm version, but
how well does it work when we fully normalize our state?

For example, if we [normalize our
state](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape#designing-a-normalized-state)
into a structure with `byId` and `allIds`, then we need to rethink how we
represent `WebData`.


```typescript
// example normalized state
interface IState {
  readonly users: {
    readonly authUser: IUser['id']

    readonly byId: {
      readonly [key: number]: IUser
    }

    readonly allIds: ReadonlyArray<IUser['id']>
  }
  // --snip--
}
```

So how could we represent `Loading`, `NotAsked`, `Failure`, and `Success`
without resorting to `boolean` flags?

If we define `byId` as `WebData<{ readonly [key: number]: IUser }>`, then
whenever we fetch a single user, all the users will transition to the loading
state. No good. If we were using flags, we could just add a `loading` flag to `IUser`.

We could define each `byId` as `WebData<{ readonly [key: number]:
WebData<IUser> }>`, and do the same for `authUser: WebData<IUser['id']>`.

The only issue with this approach is that when accessing plain objects `{}` by key
and the value doesn't exist, we get
`undefined`. Ideally we would have a custom `Map` type that provides a default if
the user doesn't exist, something like [Python's
`defaultdict`](https://docs.python.org/3.7/library/collections.html#collections.defaultdict).

So with the following `State`, we handle the case where we want to fetch
individual users.

```typescript
interface IState {
  readonly users: {
    readonly authUser: WebData<IUser['id']>

    readonly byId: {
      readonly [key: number]: WebData<IUser>
    }

    readonly allIds: ReadonlyArray<IUser['id']>
  }
}

// fetching a single user at a time
export function userDetailView(): string {
  const state: IState = {
    users: {
      authUser: {kind: k.NotAsked},
      byId: {},
      allIds: []
    }
  }

  // likely passed in from URL
  const id = 1

  const user = state.users.byId[id]

  switch (user.kind) {
    case k.NotAsked:
      return "Haven't fetch user yet"
    case k.Loading:
      return "Loading user..."
    case k.Failure:
      return `Uh oh! There was a failure: ${user.failure}`
    case k.Success: {
      return "Huzzah! User fetched and found. User email: " + user.data.email
    }
  }
}
```

Now what about the case of a list view of users?

We can use the same setup as `byId`.

So `allIds` changes from type `ReadonlyArray<IUser['id']>` to `WebData<ReadonlyArray<IUser['id']>>`.

This means that when we are fetching all the users for the list view, we will not be able to retrieve the users until the data type `Success<T>`.

And our list view might look something like this:

```typescript
// for now we have to specify the type guard
// see https://github.com/Microsoft/TypeScript/issues/16069
const isSuccess = <T>(x: WebData<T>): x is Success<T> => x.kind === k.Success

// render a list of users
export function userList(): string {
  const state: IState = {
    users: {
      authUser: { kind: k.NotAsked },
      byId: {},
      allIds: {
        kind: k.NotAsked
      }
    }
  }

  switch (state.users.allIds.kind) {
    case k.NotAsked:
      return "You haven't fetch the users yet"
    case k.Loading:
      return "Loading..."
    case k.Failure:
      return `Uh oh! There was a failure: ${state.users.allIds.failure}`
    // We will get a compiler error if we leave a case out, with strict function types turned on
    case k.Success: {
      const emails = state.users.allIds.data
        .map(id => state.users.byId[id])
        .filter(isSuccess)
        .map(u => u.data.email)
        .join(", ")
      return "Huzzah! Users fetched. Emails: " + emails
    }
  }
}
```

And if we wanted to add an updating state for `IUser`, we could just add
another case to our `RemoteData` type.

```typescript
const enum k {
  NotAsked,
  Loading,
  Failure,
  Success,
  Updating,
}

interface NotAsked {
  readonly kind: k.NotAsked
}

interface Loading {
  readonly kind: k.Loading
}

interface Failure<E> {
  readonly kind: k.Failure,
  readonly failure: E
}

interface Success<T> {
  readonly kind: k.Success,
  readonly data: T
}

// we likely want data in Updating since we still want to render the user.
interface Updating<T> {
  readonly kind: k.Updating,
  readonly data: T
}

type RemoteData<E, T> =
  | NotAsked
  | Loading
  | Failure<E>
  | Success<T>
  | Updating<T>
```

Great. That works. We've handled both the detail view and the list view and
can easily add additional states to our `RemoteData` type.

If the sum types are too much of a hassle for a specific use case, then
you could always use flags for those instances, and use sum types everywhere else.

By using sum types we let the compiler prevent UI errors from ever occurring.
