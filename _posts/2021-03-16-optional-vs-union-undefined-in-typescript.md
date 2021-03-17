---
layout: post
title: "Are you sure you want `?` and not `| undefined` in your type?"
description: Optional vs possibly `undefined` in TypeScript
date: 2021-03-16
---

Let's say we have a React component that renders a user's profile image:

```tsx
function Avatar({
  url,
  className
}: {
  readonly url: string
  readonly className?: string
}) {
  return <img src={url} className={className} alt="user avatar" />
}
```

In this case `className` is [marked optional via `?`][0] since we don't always
want to pass in a `className`, which allows us to write:

```tsx
declare const avatarUrl: string

function App() {
  return <Avatar url={avatarUrl} />
}

// or if we're in the mood for a little padding
function App() {
  return <Avatar url={avatarUrl} className="px-2" />
}
```

Now let's say we want need to fetch the profile data from the server and we
want to handle the loading state in the component.

```tsx
declare function useAvatarUrl(): string | undefined

function App() {
  const avatarUrl = useAvatarUrl()
  return <Avatar url={avatarurl} />
}
```

`avatarUrl` is now possibly `undefined`, but no big deal, we update our
component's param types accordingly:

```tsx
function Avatar({
  url,
  className
}: {
  readonly url?: string
  readonly className?: string
}) {
  if (url == null) {
    return <AvatarLoading />
  }
  return <img src={avatarUrl} className={className} alt="user avatar" />
}
```

See the problem?

While we can now use our hook, we can also skip passing in the `url` param
altogether:

```tsx
function App() {
  return <Avatar /> // type checks
}
```

But that wasn't what we wanted, we only wanted to allow `url` to be sometimes
`undefined`.

So what we should have written was [a union type][1]:

```tsx
function Avatar({
  url,
  className
}: {
  readonly url: string | undefined
  readonly className?: string
}) {
  if (avatarUrl == null) {
    return <AvatarLoading />
  }
  return <img src={avatarUrl} className={className} alt="user avatar" />
}
```

**TL;DR**: [`?`][0] is not equivalent to [`| undefined`][1], consider your API when choosing one over the other

[0]: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#optional-properties
[1]: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#defining-a-union-type
