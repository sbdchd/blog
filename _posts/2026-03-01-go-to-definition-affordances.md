---
layout: post
title: "Go to Definition Affordances"
description: Sharpening the Axe
---

TypeScript and Rust-Analyzer support a handful of quality of life, code navigation improvements.

For example, if you try to go-to-definition on a variable in your IDE, but end up clicking the trailing comma, it still navigates to the variable.

```ts
let a = 10
//  ^ go-to-def destination
foo(a, b)
//   ^ go-to-def source
```

We'll cover additional features below.

## TypeScript

### JSX

In the following example, go-to-def works even though we're trying to access the trailing `}`.

```tsx
function Foo() {
  const [state, setState] = useState()
  //     ^ go-to-def destination
  return <Bar value={state} onChange={setState} />
  //                      ^ go-to-def source
}
```

### Switch case

Go-to-def on the `case` or `default` keywords in a `switch` statement navigates to the `switch` keyword.

```ts
switch (x) {
  // ^ go-to-def destination
  case "Foo":
    return 1
  case "Bar":
    // ^ go-to-def source
    return 2
  case "Buzz":
    return 3
  default:
    // ^ go-to-def source
    return 4
}
```

### Const, Let, Function

Go-to-def on `const`, `let` or `function` in a variable or function definition brings you to that item's name.

However, this doesn't work for variables that have multiple assignments:

```ts
const [state, setState] = useState()
```

### Function Returns

Go-to-def on a `return` keyword in a function definition will bring you to the function's name.

```ts
function foo() {
  //     ^ go-to-def destination
  return "foo"
  //  ^ go-to-def source
}
```

### Symbols

When go-to-def'ing on a symbol, like `)`, `[`, `}`, `;`, `,` TypeScript does the right thing and picks the previous node.

## Squawk

In addition to [the symbol support](https://github.com/sbdchd/squawk/blob/c1f6c7c499ec1d0de475c14d73a017ad149841ec/crates/squawk_ide/src/offsets.rs#L11C56-L11C56) like TypeScript, Squawk supports a couple other navigation niceties.

### Case Expressions

Go-to-def'ing on `when`, `else`, or `end` in a `case` expression brings you to the `case` keyword.

```sql
select case
--     ^ go-to-def destination
  when true then
-- ^ go-to-def source
    1
  else
-- ^ go-to-def source
    2
  end;
-- ^ go-to-def source
```

### Transaction DDL

`commit` & `rollback` will navigate back to the initial `begin` or `start transaction`.

```sql
begin;
-- ^ go-to-def destination
commit;
-- ^ go-to-def source
rollback;
-- ^ go-to-def source
```

## Conclusion

Much like increasing the size of click targets in a UI, we can offer similar improvements in our IDEs.
