---
layout: post
title: "Quick Fix to Disable Lint Errors"
description: "How some tools do it"
---

I want to add a couple new quick fixes to [Squawk's LSP server](https://github.com/sbdchd/squawk/tree/6c5e24580bc24f2c9f63e023c1cd3f0d5569709b/crates/squawk_server) to support ignoring [rules](https://squawkhq.com/docs/rules).

One quick fix would disable the lint rule for the failing line and one would disable it for the entire file.

Before building this out, I wanted to check how other LSP servers handle edge cases. Adding a new comment to the previous line is straightforward, but updating an existing comment with another rule name is trickier.

## Ruff

First up is Ruff.

### No existing comment

I have the following code that is violating Ruff's [PT023 rule](https://docs.astral.sh/ruff/rules/pytest-incorrect-mark-parentheses-style/), which says we shouldn't have parentheses at the end of the fixture name:

```python
@pytest.mark.db()
def test_foo(): ...
```

If we run the quick fix to disable the rule:

```
Ruff(PT023): disable for this line
```

we get:

```python
@pytest.mark.db()  # noqa: PT023
def test_foo(): ...
```

### Unknown rule in an existing comment

If we change the rule name to something that isn't valid:

```python
@pytest.mark.db()  # noqa: FOO
def test_foo(): ...
```

and run the quick fix, we get:

```python
@pytest.mark.db()  # noqa: FOOOOO  # noqa: PT023
def test_foo(): ...
```

which doesn't work, and Ruff is still reporting the error.

### Unknown rule in an existing comment with a valid prefix

Instead if you change the rule to include a valid prefix:

```python
@pytest.mark.db()  # noqa: PT0235
def test_foo(): ...
```

the quick fix produces:

```python
@pytest.mark.db()  # noqa: PT023, PT0235
def test_foo(): ...
```

which works!

### Valid ignore comment with justification

If we add a description at the end, then the quick fix will delete it when updating the comment.

So the following:

```python
@pytest.mark.db()  # noqa: PT023, PT0235 we're doing it here because x, y, z.
def test_foo(): ...
```

becomes:

```python
@pytest.mark.db()  # noqa: PT023, PT0235, RUF100
def test_foo(): ...
```

So Ruff doesn't handle most of the edge cases around updating ignore comments.

## ESLint

Let's see how ESLint stacks up.

### No existing comment

We start with the following code which has some unused variable violations.

```typescript
function foo(_: unknown, _label: string) {}
```

We then run the quick fix:

```
Disable @typescript-eslint/no-unused-vars for this line
```

which gives:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function foo(_: unknown, _label: string) {}
```

Looks good!

### Comment with description

If we write a description, we'll get an error:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars hack in the meantime
function foo(_: unknown, _label: string) {}
```

unless we add `--` to separate the rule name from the description:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- hack in the meantime
function foo(_: unknown, _label: string) {}
```

This behavior is defined in [ESLint's plugin-kit package](https://github.com/eslint/rewrite/blob/c9510f9c70b2c76892932150a5adb929bd287b50/packages/plugin-kit/src/config-comment-parser.js#L209-L220).

### Updating existing comment that has a justification

If we update the code to use `any`, so we get a `no-explicit-any` violation as well, and run the quick fix to ignore that, we get:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars -- hack in the meantime
function foo(_: any, _label: string) {}
```

Which leaves our description intact!

## Conclusion

Both Ruff & ESLint handle the initial comment insertion well. When updating existing comments, ESLint handles all the edge cases, but Ruff doesn't.
