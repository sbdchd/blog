---
layout: post
title: Problems with Flow
description: "TypeScript FTW"
---

After using [Flow](https://flow.org) for a while, here are my grievances:

#### [inexact types](https://flow.org/en/docs/types/objects/)

The following compiles with no complaints:

```ts
// @flow
type Foo = {
  a: string
}
function foo(arg: Foo) {}

foo({})
//  ^ no error!??!
```

#### [exact types](https://flow.org/en/docs/types/objects/#toc-exact-object-types)

More trouble than their worth. TypeScript doesn't have exact types, but it has
heuristics for warning about extra properties that work well:

```ts
type Foo = {
  a: string
}

function foo(arg: Foo) {}

foo({ a: "", b: "" })
//           ^^^^^
// Argument of type '{ a: string; b: string; }' is not assignable to parameter of type 'Foo'.
//   Object literal may only specify known properties, and 'b' does not exist in type 'Foo'.

const bar: Foo = {
  a: "",
  b: ""
  // ^
  // Type '{ a: string; b: string; }' is not assignable to type 'Foo'.
  //  Object literal may only specify known properties, and 'b' does not exist in type 'Foo'.
}
```

#### type imports

You can't import a type like a value, you have to [prefix the import with `type`](https://flow.org/en/docs/types/modules/#toc-importing-and-exporting-types). Otherwise you get an error:

```
Cannot import the type Foo as a value. Use import type instead. [import-type-as-value]
```

This adds unnecessary friction, TypeScript also has [type imports](https://www.typescriptlang.org/docs/handbook/modules.html#importing-types),
but they're optional.

#### [refinement invalidations](https://flow.org/en/docs/lang/refinements/#toc-refinement-invalidations) are more trouble than their worth

Yes, invalidating a refinement avoids some possible runtime errors, but it makes a lot of code more verbose. I think the tradeoff of more unsoundness for easier usage that TypeScript makes is better.

#### no `Pick` type and many more

Flow has a [limited set of utility](https://flow.org/en/docs/types/utilities/) types [compared to TypeScript](https://www.typescriptlang.org/docs/handbook/utility-types.html).
This makes it harder to properly type functions.

#### `this.` is accessible in functions without any errors

```ts
// @flow
function bar() {
  this.foo()
}
```

This compiles with no errors and explodes at runtime.

#### `empty` type shows up in error messages, but is [no where to be found](https://sourcegraph.com/search?q=context:global+repo:%5Egithub%5C.com/facebook/flow%24+empty+file:website/*+lang:markdown&patternType=literal) in the docs

<https://github.com/facebook/flow/search?q=empty>

#### `$Shape` [exists and is unsound](https://flow.org/en/docs/types/utilities/#toc-shape)
