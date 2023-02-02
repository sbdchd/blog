---
layout: post
title: "Scraping Whisk's GRPC-web API"
description: "Binary is annoying"
---

Most recipe sites include metadata (json-ld, microdata, microformat, opengraph, etc.) for search engines that makes scraping recipes a straightfoward process of:

1. download HTML from URL
2. parse metadata from HTML

Whisk doesn't include this metadata and more importantly, they don't server side render their pages, instead relying on client side rendering.

In order to scrape a client side rendered site we could:

1. use a headless browser with [Playwright](https://playwright.dev), or
2. call the underlying API the site calls

Calling the API directly is more reliable and efficent, the only problem is Whisk uses a [grpc-web](https://github.com/grpc/grpc-web) API.
This makes makes constructing and parsing API requests more difficult since we don't have the protos available to generate the client code.

### Copy as Curl

My first attempt was to `copy as curl` and `copy as fetch` the requests from the browser dev tools, but it didn't work.

I think there might be a bug with the encode/decoding of the binary being sent back and forth, since the content-length was 2 bytes longer than the original request, but each request always ended up with a 503:

```
POST https://my.whisk.com/api/grpc-web/whisk.x.recipe.v1.RecipeAPI/GetRecipe 503
```

### Grpc-web Client

My next attempt was to try and create some protos and generate a grpc-web client that would be compatible with Whisk's API.

I could sort of decipher the shape of the GRPC body from the binary API response and while I found some docs on decoding arbitrary protobuf binaries, I couldn't find anything that worked with grpc-web.

After generating a basic proto rpc I quickly realized the generated code didn't match up with the JS that Whisk was using in their site.

I turned to Sourcegraph and threw in some of the generated code in [Whisk's static files](https://web.archive.org/web/20230202031301/https://cdn.whisk.com/web/web-app/production/assets/main-c8d4e63e.4af129447c71efadc18e.js) hoping someone else had created an API client and found [Whisk's own GRPC-web implementation](https://github.com/whisklabs/grpc-ts/blob/master/tests/proto/esm.js) on [my first search](https://sourcegraph.com/search?q=context:global+%5B1%2C+%22name%22%2C+%22string%22%2C+1%5D%2C&patternType=standard&sm=1&groupBy=repo).

After comparing their example protos and generated code, I could pretty easily reverse engineer their API's proto definitions from [their site's compiled JS](https://web.archive.org/web/20230202031301/https://cdn.whisk.com/web/web-app/production/assets/main-c8d4e63e.4af129447c71efadc18e.js).

After [some minor changes](https://github.com/whisklabs/grpc-ts/compare/master...sbdchd:grpc-ts:steve/add-nodejs-support) to their GRPC library, to make it Node.js friendly, I got a working client running:

```js
+ node build/main.js
{
  "id": "10767297e7b43aa4fb88612fc1be6929c85",
  "name": "Chicken Tikka Sandwich with Mint Raita",
  "ingredients": [
    {
      "text": "250g chicken breast",
      "id": "0",
      "group": ""
    },
  // ...
}
```

which is available at [github.com/sbdchd/whisk-client](https://github.com/sbdchd/whisk-client).

### Conclusion

GRPC-web is more complicated than your standard JSON API, but reverse engineering the protos is doable.
