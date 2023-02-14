---
layout: post
title: "The Case for JavaScript Without Semicolons"
description: "Less is more!"
---

## Edits are harder with semicolons

Moving an expression into a function parameter from a variable is more involved.

<!-- prettier-ignore-start -->
```js
let x = foo();
bar(x);
```
<!-- prettier-ignore-end -->

If you try to copy the right hand side of the assignment, `foo();`, and paste it into `bar()` you can't because `;` isn't valid.

Specifically, with vim keybinds, without semicolons you can nav to the right hand side of the assignment and `Y$` (yank to the end of the line) but with semicolons you have to `yt;` (yank to `;`).

## They're inconsistent

When used, semicolons aren't added to the end of blocks, like function declarations:

```js
function foo() {}
// ^ no semicolon at the end of the line!
```

but they're added for objects:

<!-- prettier-ignore-start -->
```js
let x = {};
```
<!-- prettier-ignore-end -->

## Unnecessary clutter / visual noise

Why include them when you don't need to?
Go, Swift, Kotlin, etc. leave them off, we can too!

## But, what about automatic semicolon insertion?

It doesn't matter, Prettier & TypeScript will automatically handle the ambiguous cases

e.g., writing

```js
return
x
```

Instead of:

```js
return x
```

Will get auto formatted (and if you didn't have auto formatting then TypeScript would handle it)

Prettier will also handle ambiguous cases like:

<!-- prettier-ignore-start -->
```js
[1, 2, 3].forEach(x => console.log(x))
```
<!-- prettier-ignore-end -->

Becomes

```js
;[1, 2, 3].forEach(x => console.log(x))
```

Crisis averted!

## Conclusion

Leave off the semicolons, it's going to be okay!
