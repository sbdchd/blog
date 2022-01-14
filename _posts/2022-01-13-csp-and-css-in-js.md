---
layout: post
title: CSP and CSS-in-JS
description: "No runtime CSS-in-JS for you!"
---

So you have a React app using CSS-in-JS via some runtime library like [emotion](https://github.com/emotion-js/emotion), [styled-jsx](https://github.com/vercel/styled-jsx), [styled-components](https://github.com/styled-components/styled-components), etc.

```tsx
import React from "react"
import ReactDOM from "react-dom"
import styled from "styled-components"

const Header = styled.h1`
  color: red;
  height: 40px;
`

function App() {
  return (
    <div>
      <Header>Hello World</Header>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
```

It's working well, but you're now getting around to setting up a [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy).

You add your [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src) directive and everything is good, then you add a [`style-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src) directive, like `style-src self`, and the styling disappears. All you're left with is an error in the console:

Safari:

```
Refused to apply a stylesheet because its hash, its nonce, or 'unsafe-inline' does not appear in the style-src directive of the Content Security Policy.
```

Firefox:

```
Content Security Policy: The page’s settings blocked the loading of a resource at inline (“style-src”).
```

Chrome:

```
Refused to apply inline style because it violates the following Content Security Policy directive: "style-src self". Either the 'unsafe-inline' keyword, a hash ('sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='), or a nonce ('nonce-...') is required to enable inline execution.
```

## How do we fix it?

Basically, don't use a runtime CSS-in-JS library, they aren't compatible with strict CSP directives.

Instead you'll need to opt for a static alternative, like [CSS modules](https://github.com/css-modules/css-modules), [linaria](https://linaria.dev), [vanilla-extract](https://vanilla-extract.style), or one of the various [stylex](https://www.youtube.com/watch?v=ur-sGzUWId4) clones.
