---
layout: post
title: "Packaging Required"
description: "Enforcing Boundaries Through Visibility"
---

## Overview

Dividing your codebase into packages is helpful for avoiding a [big ball of mud](https://blog.codinghorror.com/the-big-ball-of-mud-and-other-architectural-disasters/).

Packages allow creating [boundaries](https://www.destroyallsoftware.com/talks/boundaries), by leveraging visibility rules.

In Python, there's nothing preventing you from importing code from one module into another.

Other languages have [visibility modifiers](https://en.wikipedia.org/wiki/Access_modifiers) that let you specify which parts of your code are public, but these aren't powerful enough to setup boundaries between modules.

For example, imagine you have a repo with a:

- ui component library
- dashboard app
- customer app
- api clients
- database models
- tests

There are some constraints we want to enforce to create boundaries:

- The component library shouldn't be able to import from outside itself
- The apps shouldn't be importing from each other
- The database models shouldn't be able to import api clients
- Nothing should be able to import from tests
- Tests should be able to import from everything

Enforcing this layering isn't possible with language features alone, we need something else.

_For additional motivating examples, check out this [Pants blog post](https://www.pantsbuild.org/blog/2023/04/25/visibility-feature-in-pants-2-16)._

## Enforcing Visibility

Build systems like [Bazel](https://bazel.build/concepts/visibility), [Buck2](https://buck2.build/docs/concepts/visibility/), and [Pants](https://www.pantsbuild.org/stable/docs/using-pants/validating-dependencies) all support defining explicit visibility rules.

The build systems use similar syntax for defining visibility rules, and support a wide range of constraints.

But if those systems aren't your style, you could always build something yourself. Once you have [a module graph](https://docs.astral.sh/ruff/settings/#analyze) you need to traverse it to enforce your rules.

## Conclusion

Visibility rules help enforce [boundaries](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell) in code, avoiding a ball of mud.
