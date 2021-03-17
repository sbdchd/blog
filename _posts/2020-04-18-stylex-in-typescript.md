---
title: "Stylex in TypeScript"
description: Another approach to CSS-in-JS
layout: post
date: 2020-04-18
modified_date: 2020-05-15
---

> For an overview of Stylex in video form, check out [Building the New
> Facebook with React and Relay by Frank
> Yan](https://www.youtube.com/watch?v=9JZHodNR184).

This post discusses implementing the Stylex API in TypeScript, but before we do that let's dive
into what came before.

## Before Stylex

### cx

The problems of css, and some potential solutions are covered in
[`vjeux`](https://blog.vjeux.com)'s 2014 css-in-js talks from
[nationjs](https://blog.vjeux.com/2014/javascript/react-css-in-js-nationjs.html)
and a [react
meetup](https://speakerdeck.com/vjeux/react-css-in-js-react-france-meetup).

The problems and the solutions are:

1. ✅Global Namespace -- solved by Facebook's internal `CSS` extensions and related tooling.
2. ✅Dependencies -- Facebook uses a `cx` function which wraps all `CSS` class
   names, allowing for static analysis to know all CSS dependencies at build
   time. This enables automatic inclusion of the necessary css for a given
   component.
3. ✅Dead Code Elimination -- dependencies established via `cx` enables tools to find dead code
4. ✅Minification -- by understanding the css dependencies the build tools can minimize the css class names since they can prevent conflicts
5. ✅Sharing Constants -- shared via some internal tooling across CSS and JS via PHP
6. ❌Non-deterministic Resolution -- unsolved
7. ❌Isolation -- unsolved, users can override a component's styles with their own css classes defined in a parent component.

Example usage of `cx` is similar to wrapping all string literals with a translate function:

```js
<div classNames={cx('button/container/')}>
// instead of
<div classNames="button/container/">
```

In addition to facilitating static analysis, the [`cx`
function](https://github.com/facebook/react/blob/e872cd0a7c0e88fa29b0e23f46717c6741c01000/src/vendor/stubs/cx.js)
also includes the functionality of the
[`classnames`](https://www.npmjs.com/package/classnames) js package.

The function's [doc comment](https://github.com/facebook/react/blob/e872cd0a7c0e88fa29b0e23f46717c6741c01000/src/vendor/stubs/cx.js#L19-L33) outlines how
internally the function is used to allow the class names to be transformed
statically.

```javascript
/**
 * This function is used to mark string literals representing CSS class names
 * so that they can be transformed statically. This allows for modularization
 * and minification of CSS class names.
 *
 * In static_upstream, this function is actually implemented, but it should
 * eventually be replaced with something more descriptive, and the transform
 * that is used in the main stack should be ported for use elsewhere.
 *
 * @param string|object className to modularize, or an object of key/values.
 *                      In the object case, the values are conditions that
 *                      determine if the className keys should be included.
 * @param [string ...]  Variable list of classNames in the string case.
 * @return string       Renderable space-separated CSS className.
 */
```

This transformation is further [discussed in a comment from
2013](https://github.com/facebook/react/issues/309#issuecomment-23681797) on
React's GitHub issues describing how the build step will convert:

```typescript
const classes = cx({
  Button: true,
  BigButton: !this.state.userIsPressing,
  RedButton: this.state.accountIsOverdue
})

// into

const classes =
  "Button" + !this.state.userIsPressing
    ? "BigButton"
    : "" + this.state.accountIsOverdue
    ? "RedButton"
    : ""
```

Pretty cool!

While `cx` solves many of the problems with CSS, it doesn't solve _isolation_
and _non-determinism_.

### css-in-js

In addition to covering `cx` and related tooling, `vjeux` proposes styling
components directly in JS with inline styles, no separate CSS files.

Defining styles is done through a straightforward object.

```typescript
const styles = {
  container: {
    background: '',
    border: '1px solid #cdced0',
    borderRadius: 2,
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.05)',
  },
  depressed: {
    backgroundColor: '#4e69a2',
    borderColor: '#c6c7ca',
    color: '#5890ff',
  }
}

<div style={styles.container}>
```

And individual groups of styles can be then be chosen using a merge function a la
`cx`, but without the static analysis and transformation.

```typescript
<div style={m(styles.container, this.props.isDepressed && styles.depressed)} />
```

Of the CSS Problems:

1. ✅Global Namespace -- solved by using JS which uses reasonable scoping methods
2. ✅Dependencies -- again just using normal JS, if you import it, you have access to it. Even better when it's next to your component
3. ✅Dead Code Elimination -- unused style object can be marked as dead code
4. ✅Minification -- no CSS class names to minify, only the required styles are sent with a given component
5. ✅Sharing Constants -- uses JS since the styles aren't in a different language anymore.
6. ✅Non-deterministic Resolution -- most recently defined property wins, making styles deterministic
7. ✅Isolation -- users can't define styles to override the inline styles

While inline styles eliminate most of the CSS problems outlined by `vjeux`,
they don't support pseudo classes, `At-Rules` and some other CSS features.
Some of these can be handled with event listeners and JS, or logic in the
components themselves, others would require using normal CSS as an escape hatch.

There is also the performance difference between using CSS and style objects
for component styling.

## Stylex

Stylex solves the CSS Problems in a similar way to inline styles, but uses atomic CSS instead:

1. ✅Global Namespace -- solved by using JS
2. ✅Dependencies -- build step to identify the dependencies for a given component a la `cx`
3. ✅Dead Code Elimination -- unused style object can automatically be removed
4. ✅Minification -- minify class names, reduce number of style definitions across components by sharing atomic CSS classes
5. ✅Sharing Constants -- uses JS for constants or css variables for dynamic values (Note: doesn't support IE11)
6. ✅Non-deterministic Resolution -- most recently defined property is included
7. ✅Isolation - by only allowing stylex people can't override the styles of a given component

Additionally, stylex doesn't have the performance cost of inline styles and
can better minify the styles for across components.

But a drawback compared to inline styles is that the styles themselves
aren't as flexible since the corresponding atomic classes are created at
build time.

Now let's get into some examples that outline the developer facing API:

```tsx
import { stylex } from "./stylex"

// overriding specific properties from an existing class
const styles = stylex.create({ default: { fontSize: 16 } })
const classWithSmallerFont = stylex(styles.default, { fontSize: 15 })
const classWithColorAdded = stylex(styles.default, { color: "red" })

const stylesRedBlue = stylex.create({
  blue: { color: "blue" },
  red: { color: "red" }
})
// choosing specific classes
const blueClassName = stylesRedBlue("red", "blue")

// choosing specific classes with a condition
const stylesBlue = stylex.create({
  blue: { color: "blue" },
  default: { color: "red", fontSize: 16 }
})
const isBlue = false
const classNameSometimesBlue = stylesBlue("default", isBlue && "blue")

// choosing specific classes with an object condition
const stylesPrimaryHi = stylex.create({
  primary: { fill: "var(--primary-icon)" },
  highlight: { fill: "var(--highlight-icon)" }
})
function SVGIcon({ color }: { color: "primary" | "highlight" }) {
  return (
    <svg
      className={stylesPrimaryHi({
        primary: color === "primary",
        highlight: color === "highlight"
      })}
    />
  )
}
```

So the api is pretty flexible and similar to both the inline object styles
and the `cx` based approached.

Stylex uses some build time transforms outlined [around 11:21 into the React
conf talk](https://youtu.be/9JZHodNR184?t=681) that are similar to those
discussed in the [2013 React issue using
`cx`](https://github.com/facebook/react/issues/309#issuecomment-23681797).

### What about css features besides css properties?

**Edit:** I've updated the types to support using pseudo selectors and media
queries so some of these drawbacks are no longer applicable.

- [Psuedo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes)

  Selectors that are based off structure like `:last-child`, `:nth-of-type`,
  etc. can be replaced by logic in react components. `:hover` and `:focus` can
  be replaced with event listeners and some state. `:visited` is challenging,
  I think plain CSS would be necessary.

- [`At-rules`](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule) are
  another tricky one. Media queries can be handled with
  [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
  or with
  [`window.matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
  but I'm not sure how
  [keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes)
  would be handled. Maybe fall back to `cx` for that specific case, but most
  functionality stays in stylex.

  There are also [`@page`
  rules](https://developer.mozilla.org/en-US/docs/Web/CSS/@page) which are
  probably only necessary for sites that users print stuff, like recipes and
  mapping services.

## Stylex in TypeScript

Fair warning, I don't have an implementation of the useful guts of Stylex,
just the user facing API.

Something you may have noticed from the stylex examples above is just how
dynamic the API is and we want the entire thing to be type safe. You can call
`stylex` directly to merge styles. Calling `stylex.create()` creates a
new set of styles which is a function that can be indexed to get the object
styles.

A very dynamic api but it ends up looking nice.

So let's get into the code:

```typescript
import React from "react"

type CSSProperties = React.CSSProperties & {
  "::before"?: React.CSSProperties
  "::placeholder"?: React.CSSProperties
  // avoids having to make the types more permissive to only be
  // `{ [key: string]: number | string }`
  "@media"?: [string, React.CSSProperties]
  ":hover"?: React.CSSProperties
  // other pseudo selectors follow the same pattern
}

type VargsOrObjectFunc<T> = {
  (..._args: Array<keyof T | false>): string
  (args: { [_ in keyof T]: boolean }): string
}

type Stylex = {
  (...args: Array<CSSProperties>): string
  readonly create: <T extends { [_: string]: CSSProperties }>(
    _obj: T
  ) => VargsOrObjectFunc<T> & T
}

const stylex: Stylex = Object.assign(
  () => {
    // todo: implement
    return ""
  },
  {
    create: <T extends { [_: string]: CSSProperties }>(
      _obj: T
    ): VargsOrObjectFunc<T> & T => {
      return Object.assign((..._arg: any[]) => {
        // todo: implement
        return ""
      }, _obj)
    }
  }
)
```

Yup, it's pretty weird.

Essentially we're defining functions and then attaching some extra
properties/methods to them. We attach a method called `create` to the base
`stylex` function which itself returns an intersection of a function that has
a couple overloads and the object mapping of `CSSProperties`.

There's an `any` hiding in the `create` function but the user api is still
typed appropriately via the `VargsOrObjectFunc<T> & T` type.

Below we can see some of the errors the types are able to catch:

### Compile Time Errors

```typescript
const stylesRedBlue = stylex.create({
  blue: { color: "blue" },
  red: { color: "red" }
})
const blueClassName = stylesRedBlue("red", "orange")
//                                         ^^^^^^^^
// Argument of type '"orange"' is not assignable to parameter of type 'false | "red" | "blue"'. ts(2345)
```

```tsx
const stylesPrimaryHi = stylex.create({
  primary: { fill: "var(--primary-icon)" },
  highlight: { fill: "var(--highlight-icon)" }
})
function SVGIcon({ color }: { color: "primary" | "highlight" }) {
  return (
    <svg
      className={stylesPrimaryHi({
        primary: color === "primary",
        secondary: color === "highlight"
      })}
      // No overload matches this call.
      //   Overload 1 of 2, '(..._args: (false | "primary" | "highlight")[]): string', gave the following error.
      //     Argument of type '{ primary: boolean; secondary: boolean; }' is not assignable to parameter of type 'false | "primary" | "highlight"'.
      //       Type '{ primary: boolean; secondary: boolean; }' is not assignable to type '"highlight"'.
      //   Overload 2 of 2, '(args: { primary: boolean; highlight: boolean; }): string', gave the following error.
      //     Argument of type '{ primary: boolean; secondary: boolean; }' is not assignable to parameter of type '{ primary: boolean; highlight: boolean; }'.
      //       Object literal may only specify known properties, and 'secondary' does not exist in type '{ primary: boolean; highlight: boolean; }'. ts(2769)
    />
  )
}
```

### Complete Code with Examples

Here is the whole shebang if you want to poke around the types.
Note you'll need to install the React types for the CSSProperties to type check.

<details>

<summary><code>stylex.ts</code></summary>

<!-- prettier-ignore-start -->

{% highlight typescript %}

import React from "react"

type CSSProperties = React.CSSProperties & {
  "::before"?: React.CSSProperties
  "::placeholder"?: React.CSSProperties
  // avoids having to make the types more permissive to only be
  // `{ [key: string]: number | string }`
  "@media"?: [string, React.CSSProperties]
  ":hover"?: React.CSSProperties
  // other pseudo selectors follow the same pattern
}

type VargsOrObjectFunc<T> = {
  (..._args: Array<keyof T | false>): string
  (args: { [_ in keyof T]: boolean }): string
}

type Stylex = {
  (...args: Array<CSSProperties>): string
  readonly create: <T extends { [_: string]: CSSProperties }>(
    _obj: T
  ) => VargsOrObjectFunc<T> & T
}

const stylex: Stylex = Object.assign(
  () => {
    // todo: actually implement
    return ""
  },
  {
    create: <T extends { [_: string]: CSSProperties }>(
      _obj: T
    ): VargsOrObjectFunc<T> & T => {
      return Object.assign((..._arg: any[]) => {
        // todo: actually implement
        return ""
      }, _obj)
    }
  }
)

const styles = stylex.create({ default: { fontSize: 16 } })
const classWithSmallerFont = stylex(styles.default, { fontSize: 15 })
const classWithColorAdded = stylex(styles.default, { color: "red" })

const pseudoSelectors = stylex.create({
  primary: { color: "blue" },
  classWithPseudoSelectors: {
    backgroundColor: "red",
    "::before": {
      color: "red"
    },
    "::placeholder": {
      color: "blue"
    },
    "@media": [
      "(-webkit-min-device-pixel-ratio: 0)",
      {
        fill: "blue"
      }
    ],
    ":hover": {
      backgroundColor: "green"
    }
  }
})

const stylesRedBlue = stylex.create({
  blue: { color: "blue" },
  red: { color: "red" }
})
const blueClassName = stylesRedBlue("red", "blue")

const stylesBlue = stylex.create({
  blue: { color: "blue" },
  default: { color: "red", fontSize: 16 }
})
const isBlue = false
const classNameSometimesBlue = stylesBlue("default", isBlue && "blue")

const stylesPrimaryHi = stylex.create({
  primary: { fill: "var(--primary-icon)" },
  highlight: { fill: "var(--highlight-icon)" }
})

function SVGIcon({ color }: { color: "primary" | "highlight" }) {
  return {
    className: stylesPrimaryHi({
      primary: color === "primary",
      highlight: color === "highlight"
    })
  }
}
{% endhighlight %}

<!-- prettier-ignore-end -->

</details>

## Conclusion

Stylex approach to css-in-jss is oriented towards providing a type safe,
easy to use setup, but it isn't open source so we can't use it. There
are [some](https://github.com/CraigCav/css-zero)
[similar](https://github.com/callstack/linaria)
[projects](https://github.com/giuseppeg/style-sheet),
but most mainstream css-in-js libs use [template
literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
which aren't as easy to type check as objects.

It's also nice that TypeScript is flexible enough to express APIs as dynamic as `stylex`.
