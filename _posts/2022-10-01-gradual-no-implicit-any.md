---
layout: post
title: Gradually Enabling noImplicitAny
description: TypeScript ESlint to the rescue.
---

When migrating from JS (or Flow) to TypeScript, you'll likely make concessions
for the initial conversion.

For instance, you might set [`noImplicitAny`](https://www.typescriptlang.org/tsconfig/#noImplicitAny) to `false`.

Once the migration is complete, you'll want to enable this flag, but with a
large codebase, new code gets added without types and now you have
implicit `any`s everywhere with thousands of errors related to `noImplicitAny`!

So how do we enable `noImplicitAny` and get back to the [`"strict": true`](https://www.typescriptlang.org/tsconfig/#strict) promise land?

## Stem the Tide

We need to prevent new code from being written that errors with `noImplicitAny`.

Turns out it's tricky (impossible?) to enable a TypeScript compiler option for only select files.

So instead I tried creating a separate `tsconfig` with `noImplicitAny`
enabled and gradually adding files to it, but this doesn't work. When you include
a file you need to include all its dependencies which invariably pulls in most of
the codebase and all those files need to abide by `noImplicitAny`.
Back to square one.

So a separate `tsconfig` doesn't work.

## Solution

Here's what I did instead but it's a stop gap that supports enabling `noImplicitAny`.

Use [`@typescript-eslint/typedef`](https://typescript-eslint.io/rules/typedef/):

```json
{
  "rules": {
    "@typescript-eslint/typedef": [
      2,
      {
        "parameters": true,
        "arrows": true,
        "memberVariableDeclaration": true,
        "propertyDeclaration": true
      }
    ]
  }
}
```

and then all function definition params and type definitions need to have types.

The side effect is that even when TypeScript could infer a parameter type, like
with callback functions, you still need to provide an explicit type so you end
up with more verbose code, but it's only temporary until you can enable
`noImplicitAny`.

## Conclusion

You can use `@typescript-eslint/typedef` as a stopgap to get to `noImplicitAny`.
