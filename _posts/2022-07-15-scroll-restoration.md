---
layout: post
title: Scroll Restoration with Client Side Routing
description: Instagram's vs Flickr's approach
---

With a server side rendered site like HN, the browser handles scroll restoration
automatically. If you navigate backwards and forwards with the browser's nav
buttons, your page specific scroll position will be automatically restored, even
across manual refreshes. Navigating to a new page via a link adds a new
history entry with the scroll position set to the top of the page.

When you use client side routing, like [React Router](https://reactrouter.com),
[next/router](https://nextjs.org/docs/api-reference/next/router), etc., scroll
restoration is no longer automatic.

React router has some docs with [a basic and more thorough
solution](https://v5.reactrouter.com/web/guides/scroll-restoration), but they
don't have one setup by default.

Before we dive into possible solutions, let's checkout out some sites to see how
they handle scroll restoration.

## A survey of some client side routing sites:

| site             | maintains scroll? |
| ---------------- | ----------------- |
| 1Password        | ❌                |
| Airbnb           | ✅                |
| Algolia          | ❌                |
| Auth0            | ❌                |
| AWS              | ❌                |
| CircleCI         | ❌                |
| Cloudflare       | ✅                |
| Digital Ocean    | ❌                |
| Discord          | ✅                |
| Discourse        | ✅ ️              |
| Dropbox          | ❌                |
| Elastic          | ✅                |
| Facebook         | ✅                |
| Feedly           | ❌                |
| Figma            | ❌                |
| Flickr           | ✅                |
| GitHub           | ❌                |
| Gitlab           | ✅                |
| Google Cloud     | ❌                |
| Google Search    | ✅                |
| Heroku           | ❌                |
| Instagram        | ✅                |
| Linear           | ✅                |
| Mux              | ❌                |
| NPR              | ❌                |
| Netlify          | ✅                |
| Notion           | ✅                |
| Paper            | ❌                |
| Planetscale      | ❌                |
| Reddit           | ❌                |
| Segment          | ❌                |
| Sentry           | ❌                |
| Slack            | ✅                |
| Soundcloud       | ✅                |
| Sourcegraph      | ❌                |
| Spotify          | ✅                |
| Stripe Dashboard | ❌                |
| Stripe Docs      | ❌                |
| TikTok           | ❌                |
| Trello           | ❌                |
| Twitch           | ❌                |
| Twitter          | ✅                |
| Vercel           | ✅                |
| Walmart          | ✅                |
| Youtube          | ✅                |

## Solution

There are a few requirements for scroll restoration:

- need to cache data
- need to persit scroll positions when there is a refresh
- need to restore / save scroll positions correctly

Exploring the sites that handle scroll restoration properly, there are a couple solutions.

Instagram stores the scroll positions in `sessionStorage`, sets [`history.scrollRestoration = 'manual'`](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) and `window.scroll`s to the saved position. This is logic is wrapped in a hook:

```js
import PolarisScrollPositionHistory from "PolarisScrollPositionHistory"
import browserHistory from "browserHistory"
import { useLayoutEffect } from "react"

export default function PolarisScrollPositionManager(el) {
  const ref = el.container
  useLayoutEffect(() => {
    const element = ref?.current
    if (element == null) {
      return
    }
    const location = browserHistory.browserHistory.location
    PolarisScrollPositionHistory.restoreScrollPosition(
      PolarisScrollPositionHistory.shouldRestoreScroll(
        browserHistory.browserHistory
      ),
      element
    )
    return () => {
      PolarisScrollPositionHistory.saveScrollPosition(location, element)
    }
  }, [ref])
  return null
}
```

The rest of the code is [available in a gist](https://gist.github.com/sbdchd/ff245937806465dcbb52215bd3d04a35#file-polarisscrollpositionhistory-js).

Flickr implements a simplier solution that uses the browser's default `'auto'` `scrollRestoration` and instead scrolls to the top when navigating to new pages and letting the browser handle the rest.

Below is a port of [Flickr's code](https://gist.github.com/sbdchd/3e2a7219e13d05966bed6a0dfe9506b3#file-client-app-64lkzmwa-js-L120-L121) to React.

```ts
import { useEffect } from "react"
import { useNavigationType } from "react-router-dom"

function useAutoScroll() {
  const navType = useNavigationType()
  useEffect(() => {
    // using browser back/forward buttons results in a POP type
    if (navType !== "POP") {
      window.scroll(0, 0)
    }
  }, [navType])
}
```

## Conclusion

I'm not sure why Instagram takes a more complicated approach, maybe it's from a time when browser `'auto'` `scrollRestoration` wasn't as well supported? Or maybe it allows for more fine grained control with specific page navigation scenarios?

Either way, I think the Flickr approach is a good starting point. I haven't found any problems with it so far.
