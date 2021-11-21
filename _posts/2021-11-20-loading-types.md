---
layout: post
title: Async Data Loading in React
description: Sum Types vs Bools vs Suspense
---

In JS we can fetch data asyncronously with callbacks, promises, and async/await.
For handling errors we could use exceptions or lean on the compiler and use a
[result type](https://en.wikipedia.org/wiki/Result_type).

We can integrate async data into React components with hooks,
so to fetch a user we might have a hook called `useUser`:

```tsx
function UserPage({ userId }: { userId: string }) {
  const user = useUser(userId)
  return <div>{user.email}</div>
}
```

But what about the error and loading states?

## Loading and Error States

The data doesn't appear in component instantly, we need to wait for the server
and sometimes the server fails.

So we need to surface some statuses in our API:

- `initial` -- fetch hasn't started (sometimes combined with `loading`)
- `loading` -- fetch in progress
- `refetching` -- sucessful fetch before, fetching again (sometimes combined with `success`)
- `success` -- fetch complete with data
- `error` -- fetch failed

### Tagged Unions aka Sum Types aka Discrimiated Union Types

Aka making the [impossible](https://blog.janestreet.com/effective-ml-revisited/) [states](https://www.youtube.com/watch?v=IcgmSRJHu_8) [impossible](https://docs.sourcegraph.com/dev/background-information/languages/typescript#making-invalid-states-impossible-through-union-types)

```ts
type Result<T, E> =
  | { type: "initial" }
  | { type: "loading" }
  | { type: "refetching"; data: T }
  | { type: "success"; data: T }
  | { type: "error"; err: E }
```

with some checks against the `type` field we can ensure we only render the data
when all the other cases have been handled.

```tsx
function UserPage({ userId }: { userId: string }) {
  const result = useUser(userId)
  if (result.type === "initial" || result.type === "loading") {
    return <div>Loading...</div>
  }
  if (result.type === "failure") {
    return <div>Failure...</div>
  }
  return <div>name: {result.data.name}</div>
}
```

This allows the compiler to check we've handled all the variants via
[narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html).

### Bunch of Bools

Instead of having a singular tag to check against, some libraries opt for using
individual boolean fields for each variant.

#### [SWR](https://swr.vercel.app)

```tsx
function UserPage({ userId }: { userId: string }) {
  const { data, error } = useUser(userId)
  if (!data) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Failure: {error}</div>
  }
  return <div>name: {data.name}</div>
}
```

One issue is SWR's [typing is isn't great](https://github.com/vercel/swr/blob/68ebd209430e1e668675d0758602f9fa703b147e/src/types.ts#L204-L209):

```ts
interface SWRResponse<Data, Error> {
  data?: Data
  error?: Error
  mutate: KeyedMutator<Data>
  isValidating: boolean
}
```

Presumably we can't have both `data` and `error`, but the types allow it.

#### [React Query](https://react-query.tanstack.com)

Similar to SWR's API, except it has proper tagged unions in [the return
type](https://github.com/tannerlinsley/react-query/blob/7aadd6896dd8a36e3f4ff8e7153a080528807d03/src/core/types.ts#L285-L387).

```ts
type QueryObserverResult<TData = unknown, TError = unknown> =
  | QueryObserverIdleResult<TData, TError>
  | QueryObserverLoadingErrorResult<TData, TError>
  | QueryObserverLoadingResult<TData, TError>
  | QueryObserverRefetchErrorResult<TData, TError>
  | QueryObserverSuccessResult<TData, TError>
```

And as of [TypeScript
4.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html),
we can even destructure the result and have narrowing work for the
variants (`initial`, `loading`, `success`, `refetching`, `error`).

```tsx
function UserPage({ userId }: { userId: string }) {
  const { data, status, error } = useQuery(USER_QUERY)
  if (status === "loading" || status === "idle") {
    return <div>loading...</div>
  }
  if (status === "error") {
    return <div>error: {error}</div>
  }
  return <div>name: {data.name}</div>
}
```

While we're using the `status` field for refinement, React Query also returns
boolean flags for each of the variants that we could discriminate off:

```tsx
function UserPage({ userId }: { userId: string }) {
  const { data, isLoading, isIdle, isError, error } = useQuery(USER_QUERY)
  if (isLoading || isIdle) {
    return <div>loading...</div>
  }
  if (isError) {
    return <div>error: {error}</div>
  }
  return <div>name: {data.name}</div>
}
```

#### [Apollo](https://www.apollographql.com/docs/react/api/react/hooks/#usequery)

Apollo has a similar API to SWR and React Query, but [the types aren't
great](https://github.com/apollographql/apollo-client/blob/main/src/react/types/types.ts#L73-L82):

```ts
interface QueryResult<TData = any, TVariables = OperationVariables>
  extends ObservableQueryFields<TData, TVariables> {
  client: ApolloClient<any>
  data: TData | undefined
  previousData?: TData
  error?: ApolloError
  loading: boolean
  networkStatus: NetworkStatus
  called: true
}
```

We have the same issue as SWR where `data` and `error` are available at the same
time.

```tsx
function UserPage({ userId }: { userId: string }) {
  const { loading, error, data } = useQuery(USER_QUERY)
  if (loading || data == null) {
    return <div>loading...</div>
  }
  if (error) {
    return <div>error {error}</div>
  }
  return <div>name: {data.name}</div>
}
```

### [React Suspense](https://reactjs.org/docs/concurrent-mode-suspense.html#traditional-approaches-vs-suspense)

While limited in support and experimental, Suspense has a unique API which
surfaces error and loading states by the component suspending (throwing a
promise that bubbles up to `React.Suspense` and error boundary components.).

The React docs provide a pretty thorough example and the Relay docs provide
more [info on error and loading
states](https://relay.dev/docs/guided-tour/rendering/loading-states/) as well as
[prefetching data](https://relay.dev/docs/api-reference/use-preloaded-query/).

## Conclusion

I think React Query has the best API and TypeScript definitions of the compared
libraries and I hope SWR and Apollo take some inspiration.
