---
layout: post
title: input[type="number"]
description: Unexpected change events
---

Let's say you want users to input their
[SSN](https://en.wikipedia.org/wiki/Social_Security_number) in your UI, so you
create a React component and give it a nice name, something like `<SsnInput />`.

```tsx
import React from "react"
import ReactDOM from "react-dom"

function SsnInput() {
  const [state, setState] = React.useState("")
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setState(e.target.value)
  }
  return <input value={state} onChange={handleChange} />
}

ReactDOM.render(
  <React.StrictMode>
    <SsnInput />
  </React.StrictMode>,
  document.getElementById("root")
)
```

Then you think, we really only want digits in the social security number so let's use `type="number"`:

```diff
diff --git a/src/index.tsx b/src/index.tsx
index b35e8a7..aaddd35 100644
--- a/src/index.tsx
+++ b/src/index.tsx
@@ -6,7 +6,7 @@ function SsnInput() {
   function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
     setState(e.target.value)
   }
-  return <input value={state} onChange={handleChange} />
+  return <input value={state} onChange={handleChange} type="number" />
 }

 ReactDOM.render(
```

But now there is a problem. Users can input their social security numbers, but
once they add a dash `-`, the input stops working and defaults to an empty
string.

Turns out this is a known issue with `type="number"` and `<input />`, which we can reproduce in plain JS:

```ts
const input = document.createElement("input")
input.type = "number"
input.value = ""
input.oninput = e => {
  input.value = e.target.value
}
document.getElementById("root").appendChild(input)
```

TL;DR: Using `type="number"` is risky business

Also, there's [a related issue for
React](https://github.com/facebook/react/issues/13651), but as we've seen, this
buggy UX is caused by the fundamental behavior of `<input type="number" />`.
