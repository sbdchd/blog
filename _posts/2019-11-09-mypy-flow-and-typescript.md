---
layout: post
date: 2019-11-09
title: "Soundness with Mypy, Flow, and Typescript"
---

In the [Flow FAQ page](https://flow.org/en/docs/faq/) there as interesting example centered around `Array<string | number>` as a function argument. It will form our first example for comparision between Flow and Typescript as well as Mypy.

## Example 1: Covariance

Before we dive into what covariance and invariance mean in practice, let's look at the examples.

### TypeScript ([playground](https://www.typescriptlang.org/play/index.html#code/GYVwdgxgLglg9mABMOcAUBDATljBPALkQEEd8AeAZyixjAHNEAfRMEAWwCMBTLAPgCUiAN4BYAFCIpiLNyggsSbLjwSAvhIkQE1RJ2xFSKqjTr0+iALyIA2gCIMdgDSI7nZ64h2AupvEp0fSwBCSA))

```typescript
function foo(array: Array<string | number>) {
  return array
}

const bar: Array<string> = ["a", "b", "c"]

foo(bar)
```

When we run this through TypeScript, with all the strictness knobs turned up, we don't get any compiler errors. Maybe it isn't immediately clear why this is a problem so let's throw the same code into Flow and see if it has any insights.

### Flow ([playground](https://flow.org/try/#0PTAEAEDMBsHsHcBQjIFcB2BjALgS1uqJLLABQCGATpeQJ4BcoAgtXQDwDO2lu6A5qAA+odKgC2AIwCmlAHwBKUAG9EoUJSnZUlQlRq1EAX2SYCXUBKqMW+zt159ZoALygA2gCJyHgDSgPEr7+mB4AusjEZJaU8kA))

```js
// @flow

function foo(array: Array<string | number>) {
  return
}

const bar: Array<string> = ["a", "b", "c"]

foo(bar)
```

```
9: foo(arr) // Error!
       ^ Cannot call `foo` with `bar` bound to `array` because string [1] is incompatible with number [2] in array element.
References:
7: const bar: Array<string> = ["a", "b", "c"]
                    ^ [1]
3: function foo(array: Array<string | number>) {
                                      ^ [2]
```

Flow spots the problem! If we were to pass in an array of type `Array<string>` to a function `foo(array: Array<string | number>)`, then the function could then `.push()` another element onto the array of type `number` and now our array is no longer of type `Array<string>` but instead of `Array<string | number>`.

There are two possible fixes for this, we could change our array we are passing in to be of type `Array<string | number>` or make the array immutable via `ReadonlyArray<string | number>`. The Flow FAQ [highlights the latter solution](https://flow.org/en/docs/faq/#toc-why-can-t-i-pass-an-array-to-a-function-that-takes-an-array).

### Mypy ([playground](https://mypy-play.net/?mypy=latest&python=3.8&gist=ee135651251d8b229763427ebf960f6d))

Let's see if mypy can spot the problem.

```python
from typing import List, Union

def foo(array: List[Union[str, int]]) -> None:
    return

bar: List[str] = ["a", "b", "c"]

foo(bar)
```

Yup, Mypy provides the following error and is even kind enough to provide some docs.

```
main.py:8: error: Argument 1 to "foo" has incompatible type "List[str]"; expected "List[Union[str, int]]"
main.py:8: note: "List" is invariant -- see http://mypy.readthedocs.io/en/latest/common_issues.html#variance
main.py:8: note: Consider using "Sequence" instead, which is covariant
Found 1 error in 1 file (checked 1 source file)
```

Looks like we need to change the argument from a `List` to a `Sequence`, which is a immutable form of a `List`. We could also change the type of our list argument to `List[Union[str, int]]`.

### Real world example

When setting up the new python Sentry SDK, which has type hints, I ran into [a similar
issue](https://github.com/getsentry/sentry-python/pull/444) where the
argument to the `sentry_sdk.init` method required `List[Integration]`, but I was passing
in `List[LoggingIntegration]` where `LoggingIntegration` is a subtype of
`Integration`. This failed to typecheck for the same reason as the `List[Union[str, int]]` examples above.

We can use an example to illustrate.

```python
class LoggerIntegration(Integration):
    pass

def foo(array: List[Integration]) -> None:
    return

bar: List[LoggerIntegration] = [LoggerIntegration]

foo(bar)
```

Here we have `bar` with type `List[LoggerIntegration]`, which is passed into `foo()`. If
`foo()` was allowed to mutate `bar` by appending an `Integration()` then `bar` would
no longer be of type
`List[LoggerIntegration]` but instead `List[Union[LoggerIntegration, Integration]]]`.

Once again we can follow the suggestion of `mypy` and our experience with
`flow` and use immutable lists via a `Sequence`.

## Example 2: Array Indexing

In JavaScript, when we index into a array position that doesn't exist we get `undefined`. Ultimately, this means indexing into `Array<T>` should return `T | undefined`.

Unlike the covariance example, Flow and TypeScript don't warn about this. They probably ignore this because having to check the result of each index operation is more annoying than the added soundness.

```typescript
// @flow

function head(array: Array<string>): string {
  return array[0]
}
```

No error in Flow or TypeScript. 🤷‍

In other languages, indexing into an array position that doesn't exist results into either an exception/panic/fatal error. This means that an array index can correctly be typed as a `T` since the type will never be `undefined`.

Python raises an `IndexError`, Rust has a `panic!()`, Swift has a `Fatal error: Index out of range`. You get the idea.

This isn't to say TypeScript or Flow shouldn't type array indexes as `T | undefined`, if they wanted soundness they would need to return possibly `undefined` or create a notion of a panic.

Elm is sound and takes the possibly `undefined` approach via [`Maybe`](https://package.elm-lang.org/packages/elm/core/latest/Maybe#Maybe).

<https://package.elm-lang.org/packages/elm/core/latest/Array#get>

```elm
get : Int -> Array a -> Maybe a
```

## Conclusion

Like most things in software, there are trade-offs. Flow and TypeScript are inherently unsound, which isn't a bad thing, it just means we need to be aware of their limitations.
