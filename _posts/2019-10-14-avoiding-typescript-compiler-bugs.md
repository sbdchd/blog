---
layout: post
date: 2019-10-14
title: "Avoiding TypeScript Compiler Bugs via ESlint Rules"
---

A recent bug with TypeScript at work involved spreading (`...`) a variable
that was possibly `undefined`.

My first thought when reviewing this bug was, how did TypeScript not understand
that spreading a possibly `undefined` variable is a type error? A quick check
with `tsc` shows that TypeScript understands it is a type error, so why
didn't TypeScript complain about this code?

The problematic code looked something like follows:

```typescript
function Select({ value }: ISelectProps) {
  function loadOptions(
    inputValue: string,
    callback: (res: ISearchResult[]) => void
  ) {
    let defaultOptions: ISearchResult[]
    if (value) {
      if (Array.isArray(value)) {
        defaultOptions = value
      } else {
        defaultOptions = [value]
      }
    }
    getSearchResult(inputValue).then(results => {
      callback(uniqBy([...results, ...defaultOptions], "value"))
    })
  }

  return <Async loadOptions={loadOptions} />
}
```

We can see that if `value` is falsey, `defaultOptions` will remain `undefined`;
however, TypeScript isn't warning us when we spread the `defaultOptions`.
The source of our problem lies with a [bug in TypeScript](https://github.com/microsoft/TypeScript/issues/9273).

Essentially, TypeScript's analysis fails to see that `defaultOptions` is
possibly `undefined` when the value is used inside a closure.

The fix is to initialize `defaultOptions` to an empty array.

## Prevention

So how do we prevent this TypeScript bug from biting us again?

By adding a lint for initialization declarations without values of course.

ESlint has a rule for this built in:

<https://eslint.org/docs/2.0.0/rules/init-declarations>

```json
{
  "init-declarations": ["error", "always"]
}
```

With this rule setup, we are forced to initialize our variables.

No more possibly `undefined` variables losing their strictness in closures.
