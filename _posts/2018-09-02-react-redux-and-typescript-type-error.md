---
layout: post
date: 2018-09-02
title:  "React, Redux, and TypeScript walk into a – Type Error"
---

**Attention:** There is an accompanying TypeScript project for this post:

<https://github.com/sbdchd/blog/blob/master/examples/typescript-redux-thunks-and-react/>


## The Problem

Using [TypeScript][typescript] with [Redux][redux] works pretty well. We get narrowing in
reducers via [tagged unions][tagged unions] and strong typing throughout – no `any`s to be found.

When you start making async calls, you might reach for [redux-thunk][redux-thunk], which would be a solid choice in JavaScript, but sadly, this library doesn't work well with TypeScript.

Essentially, the problem in TS is that the Redux middleware allows for using
[thunks][thunks] in `dispatch()` calls, which works fine in JavaScript, but in
TypeScript these do not have the same type as a normal action, and as such, we
get a type error. We could turn to `any` but that is less than ideal.

This means that we can't have a tagged union of all our actions in say
`IActions`, because thunks do not have equivalent types to a normal action.

If we try to union actions and thunks into `IActions`, TypeScript will warn us
that `IActions` circularly references itself, which might seem odd at first but
makes sense since in Redux thunks we can `dispatch()` any of our `IActions`,
including our thunks.

```typescript
// example redux-thunk type signature
const thunk = () => (dispatch: Dispatch<IActions>) => void

type IActions = ReturnType<typeof thunk> | ...
// notice how IActions references itself?
```

Now you might say, we'll just move the thunks to their own union,
`IActionThunks`, then we won't have the circular type error.

You are right, we won't get the circular type error anymore, but now we have an
issue because we can't `dispatch()` a thunk from another thunk.

For example, trying to dispatch another thunk, `pollingUsers()`, will result in
error since we removed it from `IActions`.

```typescript
// src/redux-thunk.tsx
const fetchingUsers = () => (dispatch: Dispatch<IActions>) => {
  dispatch(setLoadingUsers(true))
  dispatch(setErrorLoadingUsers(false))
  http
    .get("/users")
    .then((res: IResponse<IUser[]>) => {
      dispatch(setUsers(res.data))
      dispatch(pollingUsers())
      dispatch(setLoadingUsers(false))
    })
    .catch(() => {
      dispatch(setErrorLoadingUsers(true))
      dispatch(setLoadingUsers(false))
    })
}
// src/redux-thunk.tsx:27:16 - error TS2345: Argument of type '(dispatch: Dispatch<IActions>) => void' is not assignable to parameter of type 'IActions'.
//   Type '(dispatch: Dispatch<IActions>) => void' is not assignable to type '{ type: "@@MYAPP/SET_USERS"; payload: IUser[]; }'.
//     Property 'type' is missing in type '(dispatch: Dispatch<IActions>) => void'.
//
// 27       dispatch(pollingUsers())
```

Now you might just relent and use an `any`, and that's fine, it works, but the point
of this exercise is to figure out how we can maintain type integrity.

What about just using `store.dispatch()`? That wouldn't work because we have
declared our store to accept `IActions` in the `reducer`, not `IActions |
IActionThunks` which, as expected, type errors.

Before we figure out the solution, there is another issue with Redux-Thunk and
TypeScript that relates to the usage of [React-Redux][react-redux].

When using `connect()` to connect Redux to a React component, in the case of
redux-thunk, the thunks will have the incorrect type. For example:

```typescript
// src/redux-thunk.tsx
const pollingUsers = () => (dispatch: Dispatch<IActions>) => {
  http.get("/poll/users").then(() => {
    dispatch(incrPolledUsers())
  })
}
// will get passed down to the component as
(dispatch: Dispatch<IActions>) => void
// instead of
() => void
```

This due to how Redux-Thunk wraps your actions with `dispatch()` before
they are passed into the component as a prop - TypeScript doesn't know this.
We might be able to tweak the types with the help of `ReturnType<T>`, but that
is a bit tricky as you need to check whether something is a thunk or just a
normal action. Not impossible though.

Even the `mapDispatchToProps()` function will type error since `IActionThunks`
does not have a `type` property like normal actions.
You could use the object shorthand for `mapDispatchToProps`, which doesn't type
error, but the types passed into the component are still incorrect.

One solution for this is to use the `store.dispatch()`, but this is only valid
if we aren't dispatching actions from our thunks, otherwise we get a
circular type references error.

Perhaps you could finagle Redux's types to work with both thunks and normal
actions, but I am doubtful.

To be clear, you could declare `pollUsers: () => any` in your component props, but
that is not ideal.

## So what do we do?

One option is to not use `redux-thunk` and instead just use normal functions with
calls to `store.dispatch()`. Maybe it isn't [pure][pure-functions] enough, but
we don't get any type errors, and most importantly, it still works.

```typescript
// no-thunks.tsx
const fetchingUsers = () => {
  store.dispatch(setLoadingUsers(true))
  store.dispatch(setErrorLoadingUsers(false))
  http
    .get("/users")
    .then((res: IResponse<IUser[]>) => {
      store.dispatch(setUsers(res.data))
      pollingUsers()
      store.dispatch(setLoadingUsers(false))
    })
    .catch(() => {
      store.dispatch(setErrorLoadingUsers(true))
      store.dispatch(setLoadingUsers(false))
    })
}
```

The second option is to use other libraries that handle async actions and integrate into Redux.

The few I'm aware of are:

- [Redux Sagas][redux sagas]
- [Redux Observables][redux observables]
- [Redux Loop][redux loop]

I haven't used any of the above in production, so I converted the basic example
app to use the different libraries.

They are all in the [example project][example project] that I linked to in the beginning of this post.

**Tip:** setup TSLint's [no-unsafe-any][tslint-no-unsafe-any] to catch any sneaky `any`s.

## Redux Sagas

Sagas are unique as they use [generator functions][generator fns].
Now when converting to redux-sagas, you end up replacing
`store.dispatch()` with `yield put()`. There is some additional
setup involved, as Redux Saga works by having watchers that look for
particular actions and trigger a [saga][sagas]. In terms of TypeScript
friendliness, Redux Sagas doesn't use a union of actions for the args to `yield
put()`, and uses `Action<any>` instead. Many of the helper functions like
`takeLatest` also use `Action<any>` for their parameter types.

## Redux Observables

Redux Observables is similar library to Redux Sagas as it also uses watchers, which it calls
observers, that run [epics][epics], the equivalent of sagas. It uses
[RxJs][rxjs] so you will have to become familiar with complexity that comes
with that, but it results in a more declarative control flow compared to Redux
Saga.

In terms of TypeScript friendliness, Redux Observable scores pretty well, the
only issue I ran into was when I was converting `Promise`s to `Observable`s, and
`Observable.create()` was poorly typed, which I fixed by using `new
Observable()` instead.

## Redux Loop

Redux loop takes a different approach to side effects by using [The Elm
Architecture][TEA]. It also purports full TypeScript support, but in reality
its TypeScript support is less than ideal.

First, it has some strange requirements around the return types of `actions`.
This problem is further discussed in [redux-loop #160][redux-loop #160].

Additionally, when creating side effects through `Cmd.run()`, there are issues
with the function parameter type, such that arguments are not type checked.

For example, if the function `fetchingUsers` shown below takes a `string` as an
argument, we won't get a type error if we pass `Cmd.dispatch`:

```typescript
// redux-loop.ts
// -- snip --
case FETCH_USER:
    return loop({
        ...state,
        isLoadingUsers: true
    }, Cmd.run(fetchingUsers, {
        failActionCreator: setErrorLoadingUsers,
        successActionCreator: setUsers,
        // we could pass anything to fetchingUsers!
        args: [Cmd.dispatch]
    }))
// -- snip --
```

Which is because the type definition for `Cmd.run` uses `Function` and `any[]`
for the function and parameter types.

```typescript
// index.d.ts
// -- snip --
export function run<A extends Action>(
  f: Function,
  options?: {
    args?: any[];
    failActionCreator?: ActionCreator<A>;
    successActionCreator?: ActionCreator<A>;
    forceSync?: boolean;
  }
): RunCmd<A>;
// -- snip --
```

There is another sore spot that involves the return type of the function
scheduled by `Cmd.run()` – it isn't type checked. So what is passed into your
defined `failActionCreator`, or `successActionCreator` could by `any`thing.

When coding up the example, I found myself having an issue where in the reducer
I was expecting `Array<IUser>`, but received `IResponse<Array<IUser>>` from
the scheduled function.

Until Redux Loop has better TypeScript support, I think plain function calls are safer.


[redux-thunk]: https://github.com/reduxjs/redux-thunk
[thunks]: https://en.wikipedia.org/wiki/Thunk
[redux]: https://redux.js.org
[typescript]: https://www.typescriptlang.org
[tslint-no-unsafe-any]: https://palantir.github.io/tslint/rules/no-unsafe-any/
[react-redux]: https://github.com/reduxjs/react-redux
[tagged unions]: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
[pure-functions]: https://en.wikipedia.org/wiki/Pure_function
[redux sagas]: https://redux-saga.js.org
[redux loop]: https://github.com/redux-loop/redux-loop
[TEA]: https://guide.elm-lang.org/architecture/
[redux observables]: https://redux-observable.js.org
[redux-loop #160]: https://github.com/redux-loop/redux-loop/issues/160#issuecomment-335519497
[generator fns]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*
[epics]: https://redux-observable.js.org/docs/basics/Epics.html
[sagas]: https://redux-saga.js.org/docs/introduction/BeginnerTutorial.html#hello-sagas
[rxjs]: https://github.com/ReactiveX/rxjs
[example project]: https://github.com/sbdchd/blog/blob/master/examples/typescript-redux-thunks-and-react/
