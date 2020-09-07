---
layout: post
title: Relative and Absolute Imports in Python & TypeScript
date: 2020-09-07
---

## Absolute & Relative Imports

Python and TypeScript both have relative and absolute imports.

```python
# Python
# rel
from . import foo
# abs
from project.auth import foo
```

```ts
// TypeScript
// rel
import foo from "./"
// abs
import foo from "project.auth"
```

Relative imports tend to be a little shorter, but come at the cost of
readability.

However, there can be some ambiguity with absolute imports.

## Ambiguity with Absolute Imports

### Python

With the import `from base62 import decode`, it isn't clear if
`base62` is a module in our project, a third party dependency, or part of the
standard library.

We can avoid this ambiguity by ensuring we prefix imports with the top level
module of our project, namespacing all of our project imports.

If we named our project `gecko`, imports from project modules would be as follows:

```python
from gecko.base64 import decode
```

Assuming our project name is unique enough to not be a common
third party dependency, it's clear to the reader that we are importing from
our project.

### TypeScript

TypeScript can suffer from similar ambigutity when using absolute imports:

```typescript
import decode from "base64"
```

With TypeScript we can configure the [`paths`
setting](https://www.typescriptlang.org/tsconfig#paths) in our
`tsconfig.json` to alias `@/` to the root of our project.

Now imports for our project code are more clear since no third party
dependency can conflict with `@/`:

```typescript
import decode from "@/base64"
```
