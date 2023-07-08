---
layout: post
title: "User Defined Ordering Made Easy"
description: ints, floats, decimals, rationals, and strings
date: 2020-03-31
last_modified_at: 2023-07-07
---

So you have a list of items with an adjustable order, like rules, photos, posts, etc. How can you persist the order to a database?

> For the purposes of this discussion we'll be looking at Postgresql, but this post is generalizable to other datastores.

Before we dive into solutions, let's establish the API we'll need to handle ordering.

Key functions are `positionBefore` usually used for positioning an item in
the first position. `positionAfter` for adding an item at the end. And most
importantly, `positionBetween` for placing items between existing items.

Here is an interface expressing our API needs including the position
functions along with a few other functions and properties that are also
useful:

```typescript
interface IOrdering<T> {
  readonly positionBefore: (a: T) => T
  readonly positionAfter: (a: T) => T
  readonly positionBetween: (a: T, b: T) => T

  readonly positionsEqual: (a: T, b: T) => boolean
  readonly comparePositions: (a: T, b: T) => number
  readonly isValidPosition: (a: T) => boolean
  readonly FIRST_POSITION: T
}
```

Now that we can use our `IOrdering<T>` interface to compare each of the solutions.

Also, since we have a uniform interface for each solution we can more easily write a function to evaluate all the solutions:

<details>
<summary><code>function orderingCheck</code></summary>

<!-- prettier-ignore-start -->

{% highlight typescript %}
function orderingCheck<T>(kind: IOrdering<T>) {
  const STRESS_TEST_ITERATIONS = 60_000

  const positionBefore = kind.positionBefore(kind.FIRST_POSITION)
  const positionBetween = kind.positionBetween(
    positionBefore,
    kind.FIRST_POSITION
  )
  const positionAfter = kind.positionAfter(kind.FIRST_POSITION)

  let positions: Array<T> = []
  let p = positionAfter
  for (let y = 0; y < 50; y++) {
    p = kind.positionAfter(p)
    positions.push(p)
  }

  const sortedPositions = [...positions].sort(kind.comparePositions)
  expect(sortedPositions).toEqual(positions)

  let stressTestPos = positionAfter
  for (let i = 0; i < STRESS_TEST_ITERATIONS; i++) {
    let prev = stressTestPos
    stressTestPos = kind.positionBetween(kind.FIRST_POSITION, stressTestPos)
    if (kind.positionsEqual(stressTestPos, prev)) {
      return {
        positionBefore,
        positionBetween,
        positionAfter,
        stressTestPos: {
          ok: false,
          message: `ran out of precision after: ${i} steps`
        }
      }
    }
  }

  return {
    positionBefore,
    positionBetween,
    positionAfter,
    stressTestPosBytes:
      typeof stressTestPos === "string"
        ? Buffer.byteLength(stressTestPos, "utf-8")
        : null,
    stressTestPos
  }
}
{% endhighlight %}

<!-- prettier-ignore-end -->

</details>

## Integer Field

When devising an implementation your first thought might be to use an [integer column type](https://www.postgresql.org/docs/10/datatype-numeric.html#DATATYPE-INT). We store the position of our items as integers, `postion=1`, `postion=2`, `position=3`.

On first glance this seems fine, but what happens when we want to change the position of one of the items?

A simple case is swapping the positions of two items, which requires
updating the positions of each item in the database.

Now let's say we have the following items and we want to move item D to position 2.

1. A
2. B
3. C
4. D
5. E

Instead of swapping we'll need to shift all the items that are after the
insertion point by 1.

It seems annoying to have to update so many items after each position update.

What else can we do to reduce the blast radius of a position change?

We could space out the item positions by some constant, say 200, and then we'd have room to
put an item between other items without having to make a bulk update of item positions. To place an item between two existing items we could average the two positions.

However there is a limit in the number of times we can place a item
between other items before we get down to two consecutive integers. Then we'd
need a reorder the items, which is less than ideal.

[Pinterest takes the
approach](https://medium.com/pinterest-engineering/how-we-built-rearranging-pins-b11052e95c8b)
of starting off with large integers for the positioning and if they come
close to running out of space, a cron redistributes the positions.

Having crons occasionally update the items is nicer than having to run a bulk update
them on every position change, but it would be even nicer if we didn't need crons at
all.

### Implementation

While we can futz with the constant used in `positionBefore` and
`positionAfter`, it won't end up fixing the viability of integers for item
ordering.

```typescript
const Integer: IOrdering<number> = {
  positionBefore: a => a - 500,
  positionAfter: a => a + 500,
  positionBetween: (a, b) => Math.trunc((a + b) / 2),
  positionsEqual: (a, b) => a === b,
  comparePositions: (a, b) => a - b,
  isValidPosition: a => Number.isSafeInteger(a)
  FIRST_POSITION: 1,
}
```

#### Ordering Test Result

Runs out of precision after 9 steps.

## Float Field

Using [floating point](https://www.postgresql.org/docs/10/datatype-numeric.html#DATATYPE-FLOAT) we can place an item between two consecutive integers by averaging their position, so we don't need to update any additional item positions. Nice!

However,
[double precision floats](https://en.wikipedia.org/wiki/Double-precision_floating-point_format)
have 52 bits of precision, which limits the number
of times we can place an item between a pair of positions before we have to
reorder all the elements like we have to do with integers.

For example, if you continually try to move the last item in the list to the
second place, after 52 times you run out of precision and you need to reorder
everything. Which means this solution has limited space and like integers, we'll need the cron to reorder positions.

### Implementation

Similar to the integer solution we choose an arbitrary constant for
positioning before and after an item. Whatever constant we choose, we quickly
run out of precision.

```typescript
const Float: IOrdering<number> = {
  positionBefore: (a) => a - 1,
  positionAfter: (a) => a + 1,
  positionBetween: (a, b) => (a + b) / 2,
  positionsEqual: (a, b) => a === b,
  comparePositions: (a, b) => a - b,
  isValidPosition: a => Number.isFinite(a)
  FIRST_POSITION: 1,
}
```

#### Ordering Test Result

Runs out of precision after 53 steps.

## Arbitrary Decimal

Instead of limiting ourselves to the finite precision of floats we can use arbitrary precision decimals.
Like floats, we'll average two existing positions for our `positionBetween` function.

While Python has
[`Decimal`](https://docs.python.org/3.8/library/decimal.html#decimal.Decimal),
Postgres has
[`Numeric`](https://www.postgresql.org/docs/10/datatype-numeric.html),
with JS we'll [need a
library](https://github.com/MikeMcl/bignumber.js) before we can begin since arbitrary precision decimals aren't built-in.

First let's figure out the limiting precision factor across Python, Postgres,
and the JS library. Arbitrary precision are supposed to be arbitrary but
there must be some limit, right?

With Python, the precision defaults to `28` but it's configurable to any
length you'd like. No limits here.

Postgres's `numeric` type has, ["up to `131072` digits before the decimal point;
up to `16383` digits after the decimal
point"](https://www.postgresql.org/docs/10/datatype-numeric.html#DATATYPE-NUMERIC-TABLE).

And [bignumber.js has a max of `1e+9` decimal places](https://mikemcl.github.io/bignumber.js/#decimal-places), plenty of space.

So our max precision with an arbitrary precision setup is defined by
Postgres's limit of `131,072` digits before the decimal and `16,383` after the
decimal. The digits after the decimal define our precision.

### Implementation

JS lacks operator overloading so things get a bit more verbose compared to
the float and integer solutions. The upside is that we don't run out of
precision until over 50,000 moves.

```typescript
import BigNumber from "bignumber.js"

const MAX_POSTGRES_DECIMAL_PLACES = 16_383
BigNumber.set({ DECIMAL_PLACES: MAX_POSTGRES_DECIMAL_PLACES })

const Decimal: IOrdering<BigNumber> = {
  positionBefore: a => a.minus(1),
  positionAfter: a => a.plus(1),
  positionBetween: (a, b) => a.plus(b).div(2),
  positionsEqual: (a, b) => a.eq(b),
  comparePositions: (a, b) => a.comparedTo(b),
  isValidPosition: () => true,
  FIRST_POSITION: new BigNumber(1)
}
```

#### Ordering Test Result

Runs out of precision after 54,424 steps.

That's probably enough reordering for most use cases to consider this "unlimited", but we can do better.

## Rationals

Instead of storing `1/2` as a `decimal` or a `float`, we can store it as two
numbers, the numerator and the denominator via a
[rational type](https://en.wikipedia.org/wiki/Rational_data_type). Python's has
[`Fraction`](https://docs.python.org/3.8/library/fractions.html), Postgres we can use a couple fields. JavaScript doesn't ship with a Rational type in its standard library so we'll need to roll our own or find a package.

### Implementation

The rational type is simple enough so built a class out for it following the lead of Python's `fraction` module.

Note that we have to insert checks for `isSafeInteger` to ensure our integer
can safely be represented in a double precision float.

```typescript
function assert(expr: boolean) {
  if (!expr) {
    throw Error("Assertion Error")
  }
}

// https://stackoverflow.com/a/39246409/3720597
// how does JS not have this built in?!?!
function gcd(k: number, n: number): number {
  return k ? gcd(n % k, k) : n
}

class Fraction {
  readonly num: number
  readonly denom: number
  constructor(numerator: number, denominator: number) {
    assert(Number.isSafeInteger(numerator))
    assert(Number.isSafeInteger(denominator))

    // via https://github.com/python/cpython/blob/0c5ad5499798aed4cd305d324051986ed4c48c8c/Lib/fractions.py#L157-L162
    let g = gcd(numerator, denominator)
    if (denominator < 0) {
      g = -g
    }
    numerator = Math.trunc(numerator / g)
    denominator = Math.trunc(denominator / g)

    this.num = numerator
    this.denom = denominator
  }
  eq(other: Fraction): boolean {
    return this.num === other.num && this.denom === other.denom
  }
  comparedTo(other: Fraction): number {
    const a = this.num * other.denom
    const b = this.denom * other.num
    return a - b
  }
}

const Rational: IOrdering<Fraction> = {
  positionBefore: (a: Fraction) => new Fraction(a.num, a.denom + 1),
  positionBetween: (a: Fraction, b: Fraction) => {
    const num = a.num + b.num
    const denom = a.denom + b.denom
    return new Fraction(num, denom)
  },
  positionAfter: (a: Fraction) => new Fraction(a.num + 1, a.denom),
  positionsEqual: (a, b) => a.eq(b),
  comparePositions: (a, b) => a.comparedTo(b),
  isValidPosition: a =>
    Number.isSafeInteger(a.num) && Number.isSafeInteger(a.denom),
  FIRST_POSITION: new Fraction(1, 1)
}
```

> For an implementation of this rational approach in Django, [checkout this post
> by Matthew Schinckel](https://schinckel.net/2019/10/30/orders-please%21/).

#### Ordering Test Result

After 60,000 steps, final position is:

```typescript
new Fraction(600001, 60002)
```

It turns out rationals can provide a large amount of precision in a
straightforward implementation. While they are limited by
[`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) in JS, they will provide enough precision for most
use cases. Also note that the `Fraction::comparedTo` method involves
multiplication to determine order, so the usable range of integers is limited
even more than `Number.MAX_SAFE_INTEGER`.

## Strings w/ Lexicographical Sorting

While the arbitrary precision would work for most use cases, it is technically finite in precision.

To avoid the precision issues, instead of using numbers we can use
strings and sort them lexicographically. The key here is we'll never run out of
precision so we won't need a cron to occasionally reorder all the items.

I've found a couple different implementations for this, some are clearly better than others.

### Have you checked Stack Overflow?

First you have to check Stack Overflow.

And there is a answer that [provides an
implementation](https://stackoverflow.com/questions/38923376/return-a-new-string-that-sorts-between-two-given-strings/38927158#38927158)
that is a little gnarly, but seems like the right direction. Linked in the
comments is [a library](https://github.com/fasiha/mudderjs) that facilities
string based ordering but it's taken the kitchen sink approach so more bulky
than what we need for our string ordering.

### Jira

Jira has it's own internal positioning system called
[lexorank](https://confluence.atlassian.com/jirakb/understand-the-lexorank-managment-page-in-jira-server-779159218.html).
It's a bit complicated, so we'll just skip it since the other solutions
work and are easier to understanding. For those wanting a more thorough
explanation to supplement the Jira docs, take a look at [this Stack Overflow
post](https://stackoverflow.com/questions/40718900/jiras-lexorank-algorithm-for-new-stories).

### Figma

Finally, we come to Figma. Obviously you have to save the best for last so
what does this solution offer compared to the others.

The system is described in [a blog
post](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/#fractional-indexing/)
from 2017 and the important excerpt is shown below:

> To insert between two objects, just set the index for the new object to the
> average index of the two objects on either side. We use arbitrary-precision
> fractions instead of 64-bit doubles so that we can’t run out of precision after
> lots of edits.
> Each index is stored as a string and averaging is done using string
> manipulation to retain precision. For compactness, we omit the leading “0.”
> from the fraction and we use the entire ASCII range instead of just the
> numbers 0–9 (base 95 instead of base 10).

This solution avoids the reordering problem while also avoiding finite precision limits
since the position field is a string, which can be arbitrarily large.

But what does the implementation like? It's not open source and isn't their client C++?

My initial interpretation of the post was that they implemented some
arithmetic operations on base-95 numbers using the ASCII range for their
digits. So I started to implement this and it turned out to be quite tricky
and eventually I left the project to gather some dust.

Recently I found some motivation to
figure out the implementation once and for all. I was determined. After a bit of more work on
the arithmetic operations I decided to dig into the JS bundle for Figma.

[https://www.figma.com/figbuild/symlinks/figma_app.0380b72e2bc066b109c64b66ba865baa.min.js](https://web.archive.org/web/20200326040431/https://www.figma.com/figbuild/symlinks/figma_app.0380b72e2bc066b109c64b66ba865baa.min.js)

Eventually I found what I was looking for, `positionBetween`,
`positionAfter`, `positionBefore` functions with variables that defined the start
and end of their base 95 alphabet.

Below is the code that I unminified (no source maps sadly) and cleaned up to my liking.

```typescript
const START_CHAR_CODE = 32
const END_CHAR_CODE = 126
export const FIRST_POSITION = String.fromCharCode(START_CHAR_CODE + 1)

function assertDev(expr: boolean) {
  if (!expr) {
    throw Error("Assertion Error")
  }
}

export function comparePositions(firstPos: string, secondPos: string) {
  return +(firstPos < secondPos) - +(firstPos > secondPos)
}

export function isValidPosition(pos: string) {
  if (pos === "" || pos.charCodeAt(pos.length - 1) == START_CHAR_CODE) {
    return false
  }
  for (let i = 0; i < pos.length; i++) {
    const t = pos.charCodeAt(i)
    if (t < START_CHAR_CODE || t > END_CHAR_CODE) {
      return false
    }
  }
  return true
}

export function positionBefore(pos: string) {
  assertDev(0 !== pos.length)

  for (let i = pos.length - 1; i >= 0; i--) {
    let curCharCode = pos.charCodeAt(i)
    if (curCharCode > START_CHAR_CODE + 1) {
      let position = pos.substr(0, i) + String.fromCharCode(curCharCode - 1)
      assertDev(isValidPosition(position))
      return position
    }
  }
  let position =
    pos.substr(0, pos.length - 1) +
    String.fromCharCode(START_CHAR_CODE) +
    String.fromCharCode(END_CHAR_CODE)
  assertDev(isValidPosition(position))
  return position
}
export function positionAfter(pos: string) {
  assertDev(0 !== pos.length)

  for (let i = pos.length - 1; i >= 0; i--) {
    let curCharCode = pos.charCodeAt(i)
    if (curCharCode < END_CHAR_CODE) {
      let position = pos.substr(0, i) + String.fromCharCode(curCharCode + 1)
      assertDev(isValidPosition(position))
      return position
    }
  }
  let position = pos + String.fromCharCode(START_CHAR_CODE + 1)
  assertDev(isValidPosition(position))
  return position
}

function avg(a: number, b: number) {
  return Math.trunc((a + b) / 2)
}

export function positionBetween(firstPos: string, secondPos: string) {
  assertDev(firstPos < secondPos)
  let flag = false
  let position = ""
  const maxLength = Math.max(firstPos.length, secondPos.length)
  for (let i = 0; i < maxLength; i++) {
    const lower = i < firstPos.length ? firstPos.charCodeAt(i) : START_CHAR_CODE
    const upper =
      i < secondPos.length && !flag ? secondPos.charCodeAt(i) : END_CHAR_CODE
    if (lower === upper) {
      position += String.fromCharCode(lower)
    } else if (upper - lower > 1) {
      position += String.fromCharCode(avg(lower, upper))
      flag = false
      break
    } else {
      position += String.fromCharCode(lower)
      flag = true
    }
  }

  if (flag) {
    position += String.fromCharCode(avg(START_CHAR_CODE, END_CHAR_CODE))
  }
  assertDev(firstPos < position)
  assertDev(position < secondPos)
  assertDev(isValidPosition(position))
  return position
}
```

Maybe not obvious what every part is doing, but nothing too crazy, and
more importantly it works.

Compared to the arbitrary decimal approach we:

- don't need an extra library that's [8.1KB gzipped](https://bundlephobia.com/result?p=bignumber.js@9.0.0)
- get easy sorting in JS
- get shorter position values compared to arbitrary decimal
- and **never** run out of precision

#### Open Source Implementations

| lang       | name                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Javascript | [fractional-indexing](https://github.com/rocicorp/fractional-indexing)                                                                  |
| Python     | [fractional-indexing-python](https://github.com/httpie/fractional-indexing-python)                                                      |
| Kotlin     | [fractional-indexing-kotlin](https://github.com/darvelo/fractional-indexing-kotlin)                                                     |
| Go         | [fracdex](https://github.com/rocicorp/fracdex)                                                                                          |
| Rust       | [fractional_index](https://docs.rs/fractional_index/latest/fractional_index/)                                                           |
| Python     | [ordering](https://github.com/recipeyak/recipeyak/blob/09f6d11d4ea44cc0966ee534eb53cac818c614c2/backend/recipeyak/ordering/__init__.py) |
| TypeScript | [ordering](https://github.com/recipeyak/recipeyak/blob/09f6d11d4ea44cc0966ee534eb53cac818c614c2/frontend/src/ordering.ts)               |

And there's also a blog post from Evan Wallace:

<https://madebyevan.com/algos/crdt-fractional-indexing/>

### Implementation

Above is the actual implementation, but for keeping with the form of the other examples here is the `IOrdering<string>`

```typescript
// where Figma is the module containing the above code.
const Lexico: IOrdering<string> = {
  positionBefore: Figma.positionBefore,
  positionAfter: Figma.positionAfter,
  positionBetween: Figma.positionBetween,
  positionsEqual: (a, b) => a === b,
  comparePositions: (a, b) => -Figma.comparePositions(a, b),
  isValidPosition: Figma.isValidPosition,
  FIRST_POSITION: Figma.FIRST_POSITION
}
```

#### Ordering Test Result

After 60,000 steps, the final position is a string that is a touch over `10KB`.

Kind of large but since postgres stores text fields in compressed form the
`10KB` gets reduced to `127` bytes which is far under the 8191 byte limit on
indexes.

## Conclusion

First we tried integers, which made updates difficult. Then we tried floats
which seemed good but ran out of precision after a smallish number of
moves requiring a reordering of all the elements.

To combat this we tried float's cousin, arbitrary precision decimals, which
worked well, but the fields ended up rather long and they weren't
arbitrary precision, supporting ~50K moves before running out of precision.

We then gave rationals a shot which are pretty great with some caveats around
how large the numerators and denominators can get before out running JS's
`Number.MAX_SAFE_INTEGER`.

At last, we found ourselves strings. Strings didn't suffer from the issues of
JavaScript's `number`. And after skipping over some less than ideal
algorithms we found Figma's approach. And all was good.

Strings turn out to work pretty well for user defined ordering.

### Other Resources

Looking for solutions to sorting I found [this
post](https://begriffs.com/posts/2018-03-20-user-defined-order.html) where
the author covers techniques including integers, floats, decimals and some
other fancier approaches with Postgres based implementations. Well worth a
read.

Additionally, there's a great observable notebook, [Implementing Fractional
Indexing](https://observablehq.com/@dgreensp/implementing-fractional-indexing),
which provides insight into the why behind Figma's algorithm.
