---
layout: post
title: Avoiding Implicit Conversions in TypeScript
description: With the help of ESLint
---

Let's start off with a pop quiz, does the following code result in an error?

```ts
declare const foo: string | undefined
declare const bar: string | undefined

console.log(foo + " " + bar)
```

The answer: TypeScript is happy.

While this won't result in a runtime error due to implicit conversion of
`undefined` to `'undefined'`, it can result in various combinations of
`undefined` ending up in the concatenated string.

Really what we want is for `+` to only work with like types, aka no implicit
conversions.

## ESLint

Luckily, `typescript-eslint` ships with the [`no-base-to-string` rule](https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-base-to-string.md), which
results in the above code raising an error.

And once we have that enabled:

```ts
declare const foo: string | undefined
declare const bar: string | undefined

console.log(foo + " " + bar)

// eslint index.ts
//  4:13  error  Operands of '+' operation must either be both strings or both numbers. Consider using a template literal  @typescript-eslint/restrict-plus-operands
//  4:13  error  Operands of '+' operation must either be both strings or both numbers. Consider using a template literal  @typescript-eslint/restrict-plus-operands
```

Problem solved!

### Related

There are a couple similar rules that you might want to consider:

- <https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/restrict-template-expressions.md>
- <https://eslint.org/docs/rules/no-implicit-coercion>
