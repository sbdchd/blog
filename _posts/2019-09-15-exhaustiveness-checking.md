---
layout: post
date: 2019-09-15
title: "Exhaustiveness Checking and Breaking API Changes"
---

Let's imagine we have a TypeScript based app that fetches comments from an API.

The API might look like following:

```typescript
interface IComment {
  readonly id: number
  readonly approvalStatus: "pending" | "approved" | "hidden"
}

export const getComment = (id: IComment["id"]) =>
  http.get<IComment>(`/api/v1/comments/${id}/`)
```

And suppose we have a function to translate the `approvalStatus` property
into a more descriptive string for the UI.

```typescript
function getApprovalStatusMessage(status: IComment['approvalStatus']): string {
  switch (status) {
    case "pending":
      return "⏳ Pending. Waiting on approval from the author."
    case "approved":
      return "✅ Approved"
    case "hidden":
      return "🤫 This message has been hidden from view."
  }
}
```

## Exhaustiveness checking

With TypeScript's exhaustiveness checking, if we forget a case the compiler will warn us.


```typescript
function getApprovalStatusMessage(status: IComment['approvalStatus']): string {
  //                                                                   ~~~~~~
  // Function lacks ending return statement and return type does
  // not include 'undefined'. ts(2366)
  switch (status) {
    case "pending":
      return "⏳ Pending. Waiting on approval from the author."
    case "approved":
      return "✅ Approved"
  }
}
```

The TypeScript docs [outline the usage of
`never`](https://www.typescriptlang.org/docs/handbook/advanced-types.html#exhaustiveness-checking)
in exhaustiveness checking to ensure we handle all cases.

```typescript
function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}
```

By using `assertNever` we can omit the return type if we want, and the
compiler will still ensure we handle each case of the union.

```typescript
function getApprovalStatusMessage(status: IComment['approvalStatus']): string {
  switch (status) {
    case "pending":
      return "⏳ Pending. Waiting on approval from the author."
    case "approved":
      return "✅ Approved"
    default:
      return assertNever(status)
  //                     ~~~~~~
  // Argument of type '"hidden"' is not assignable to parameter of type 'never'.
  // ts(2345)
  }
}
```

## Changing the API

Now what happens if we update the API to return an additional variant
`"spam"` in the union?

Since we are casting the response of the API call to our `IComment`
interface, we won't get an error until we call `getApprovalStatusMessage`
which will throw an exception.

Not a great experience for the user since they will likely see an error.

We could update the definition of `assertNever` to not throw an exception.

```typescript
function assertNever(x: never): never {
  return x
}
```

but we are just silently ignoring a type error and letting it propagate
hoping that later calls will handle the unexpected value gracefully. Wishful
thinking.

We could opt to use a validation library like `io-ts` for parsing the
response of the API call to ensure it matches the interface.


```typescript
const Comment = t.type({
  id: t.number,
  approvalStatus: t.keyof({
    pending: null,
    approved: null,
    hidden: null
  })
})
```

and then when the backend updates we get an error parsing the response.

```typescript
const res = await getComment(id)
const result = Comment.decode(res)
// `result` is an error
```

However this means that parsing of the API response will fail, so clients
that are using an older version of the JS bundle will have a union without
the `"spam"` variant and will no longer function.

## Potential Solutions

The breakage caused by the new `"spam"` variant is ultimately caused by the
backend making a backwards incompatible change in its API. A change of
`IComment['id']` from `number` to `string` is a pretty clear breaking change
but adding another variant to an `enum` might not be as obvious.

You might also consider the breakage a failure of the client code to follow the
[robustness principle](https://en.wikipedia.org/wiki/Robustness_principle),
one of the solutions addresses this.

There isn't a straightforward way to add a new enum variant in a backwards
compatible manner.
[An issue](https://github.com/graphql/graphql-js/issues/968) on the JS GraphQL implementation repo discusses the danger of
adding a new enum variant and [one of the suggestions](https://github.com/graphql/graphql-js/issues/968#issuecomment-317834310) is to add `default`
cases to your `switch` statements, but this isn't something that is enforced by the
compiler. You could write a lint, but I think a better solution would to
either update your client code first or add an `unknown` variant to your
client enums.

### Updating your client code first

Instead of sprinkling `default` cases when working with enums you could
update the client code first and ensure your users are using the updated
bundle with the new `"spam"` variant.

The issue with this approach is ensuring that all your clients are on the updated bundle.

How can you be sure they aren't using the old bundle version?

You could utilize version tracking of your client applications. Something like a
`x-app-version` header in your API requests would do the trick. And then
only update the backend once all your clients have updated to code that can
handle the new variant.

**Aside:** You may also want the client code to make a request to the backend every so
often to ensure the user isn't using an ancient bundle. If they are you can
have the client `window.reload()`.

### Adding an `unknown` variant

Instead of ensuring all your clients are updated to the latest bundle before
updating the API, you could make the clients parsing of enums more robust
by adding an `unknown` case to your client enums.

When the client is parsing a response and it encounters an new enum variant
that it doesn't know, it can default to the `unknown` variant.

```typescript
interface IComment {
  readonly id: number
  readonly approvalStatus: "pending" | "approved" | "hidden" | "unknown"
}
```

This means that you can use the compiler to ensure you handle all the enum
cases in a safe manner. I think this solution abides by the robustness
principle more so than updating the client code first.

## Conclusion

Beware of API changes – especially of changes that are backwards incompatible.
