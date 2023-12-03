---
layout: post
title: "Failing to Migrate from Vite to Next.js"
description: "a friction log"
---

## Step 1: Read Some Docs

<https://nextjs.org/docs/app/building-your-application/upgrading/from-vite#migration-steps>

Formatting is [broken with the step numbers](https://github.com/vercel/next.js/issues/59215), lots of 1. 1. 1. 1.

Weird that the suggested file ending for the config file is `.mjs`

## Step 2: Install Next.js aka the First Issue

**Time**: Sun Dec 3, 12:20pm EST

```shell
❯ yarn add next@latest
yarn add v1.22.17
[1/4] 🔍 Resolving packages...
[2/4] 🚚 Fetching packages...
warning Pattern ["string-width@^4.1.0"] is trying to unpack in the same destination "/Users/steve/Library/Caches/Yarn/v6/npm-string-width-cjs-4.2.3-269c7117d27b05ad2e536830a8ec895ef9c6d010-integrity/node_modules/string-width-cjs" as pattern ["string-width-cjs@npm:string-width@^4.2.0"]. This could result in non-deterministic behavior, skipping.
warning Pattern ["wrap-ansi@^7.0.0"] is trying to unpack in the same destination "/Users/steve/Library/Caches/Yarn/v6/npm-wrap-ansi-cjs-7.0.0-67e145cff510a6a6984bdf1152911d69d2eb9e43-integrity/node_modules/wrap-ansi-cjs" as pattern ["wrap-ansi-cjs@npm:wrap-ansi@^7.0.0"]. This could result in non-deterministic behavior, skipping.
warning Pattern ["string-width@^4.2.3"] is trying to unpack in the same destination "/Users/steve/Library/Caches/Yarn/v6/npm-string-width-cjs-4.2.3-269c7117d27b05ad2e536830a8ec895ef9c6d010-integrity/node_modules/string-width-cjs" as pattern ["string-width-cjs@npm:string-width@^4.2.0"]. This could result in non-deterministic behavior, skipping.
warning Pattern ["string-width@^4.2.0"] is trying to unpack in the same destination "/Users/steve/Library/Caches/Yarn/v6/npm-string-width-cjs-4.2.3-269c7117d27b05ad2e536830a8ec895ef9c6d010-integrity/node_modules/string-width-cjs" as pattern ["string-width-cjs@npm:string-width@^4.2.0"]. This could result in non-deterministic behavior, skipping.
error next@14.0.3: The engine "node" is incompatible with this module. Expected version ">=18.17.0". Got "18.7.0"
error Found incompatible module.
info Visit https://yarnpkg.com/en/docs/cli/add for documentation about this command.
```

### The Fix

```
volta pin node@20
```

## Step 3. More reading through docs

### Favicons

Favicon and related are configured differently than vite, with vite we use <https://github.com/darkobits/vite-plugin-favicons> which works well and is easy to configure!

### Env Vars

Need to change the env var access & prefix, can't configure it [like we can with vite](https://vitejs.dev/config/shared-options.html#envprefix) which is annoying.

### Component Aliases for Absolute Paths

We configure this in [TypeScript](https://github.com/recipeyak/recipeyak/blob/4a1764e71f7a328d6e81ae381f0faa8a34b0a5f1/frontend/tsconfig.json#L23-L24) and [Vite](https://github.com/recipeyak/recipeyak/blob/4a1764e71f7a328d6e81ae381f0faa8a34b0a5f1/frontend/vite.config.ts#L29-L34), while Next.js will look at the tsconfig to set this up for us.

### Proxying API Requests

This doesn't work with the `"output": "export"` apparently which means we end up with preflight requests in dev -- not great.

[Vite supports](https://vitejs.dev/config/server-options.html) [setting up proxy rewrites](https://github.com/recipeyak/recipeyak/blob/4a1764e71f7a328d6e81ae381f0faa8a34b0a5f1/frontend/vite.config.ts#L37-L40)

### Migrating / Continuing to Use Vitest?

Unclear if we can use Vitest with Next.js.

## Step 4. Running `next dev`

```shell
❯ s/dev

- yarn next dev
  yarn run v1.22.17
  \$ /Users/steve/projects/recipeyak/frontend/node_modules/.bin/next dev
  (node:26386) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
  (Use `node --trace-warnings ...` to show where the warning was created)
  /Users/steve/projects/recipeyak/frontend/next.config.js:21
  export default nextConfig
  ^^^^^^

SyntaxError: Unexpected token 'export'
```

### The Fix

Add `"type": "module"` to `package.json`

## Step 5. Running `next dev` again

Got a bunch of duplicate errors about `postcss.config.js` (a file related to our tailwindcss setup) and also some warnings about the rewrites not being supported.

```
❯ s/dev

- yarn next dev
  yarn run v1.22.17
  \$ /Users/steve/projects/recipeyak/frontend/node_modules/.bin/next dev
  ⚠ Specified "rewrites" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
  ⚠ Specified "rewrites" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
  ▲ Next.js 14.0.3
  - Local: http://localhost:3000
  - Environments: .env

⚠ Specified "rewrites" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
⚠ Specified "rewrites" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
✓ Ready in 2.8s
○ Compiling /[[...slug]] ...
Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/steve/projects/recipeyak/frontend/postcss.config.js from /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js not supported.
postcss.config.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which declares all .js files in that package scope as ES modules.
Instead either rename postcss.config.js to end in .cjs, change the requiring code to use dynamic import() which is available in all CommonJS modules, or change "type": "module" to "type": "commonjs" in /Users/steve/projects/recipeyak/frontend/package.json to treat all .js files as CommonJS (using .mjs for all ES modules instead).

    at mod.require (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/require-hook.js:64:28)
    at findConfig (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js:58:20)
    at async getPostCssPlugins (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:89:18)
    at async /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/index.js:124:36
    at async Object.resolveUrlLoader (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js:60:25) {

code: 'ERR_REQUIRE_ESM'
}
Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/steve/projects/recipeyak/frontend/postcss.config.js from /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js not supported.
postcss.config.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which declares all .js files in that package scope as ES modules.
Instead either rename postcss.config.js to end in .cjs, change the requiring code to use dynamic import() which is available in all CommonJS modules, or change "type": "module" to "type": "commonjs" in /Users/steve/projects/recipeyak/frontend/package.json to treat all .js files as CommonJS (using .mjs for all ES modules instead).

    at mod.require (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/require-hook.js:64:28)
    at findConfig (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js:58:20)
    at async getPostCssPlugins (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:89:18)
    at async /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/index.js:124:36
    at async Object.resolveUrlLoader (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js:60:25) {

code: 'ERR_REQUIRE_ESM'
}
⨯ unhandledRejection: Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/steve/projects/recipeyak/frontend/postcss.config.js from /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js not supported.
postcss.config.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which declares all .js files in that package scope as ES modules.
Instead either rename postcss.config.js to end in .cjs, change the requiring code to use dynamic import() which is available in all CommonJS modules, or change "type": "module" to "type": "commonjs" in /Users/steve/projects/recipeyak/frontend/package.json to treat all .js files as CommonJS (using .mjs for all ES modules instead).

    at mod.require (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/require-hook.js:64:28)
    at findConfig (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js:58:20)
    at async getPostCssPlugins (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:89:18)
    at async /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/index.js:124:36
    at async Object.resolveUrlLoader (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js:60:25) {

code: 'ERR_REQUIRE_ESM'
}
⨯ unhandledRejection: Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/steve/projects/recipeyak/frontend/postcss.config.js from /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js not supported.
postcss.config.js is treated as an ES module file as it is a .js file whose nearest parent package.json contains "type": "module" which declares all .js files in that package scope as ES modules.
Instead either rename postcss.config.js to end in .cjs, change the requiring code to use dynamic import() which is available in all CommonJS modules, or change "type": "module" to "type": "commonjs" in /Users/steve/projects/recipeyak/frontend/package.json to treat all .js files as CommonJS (using .mjs for all ES modules instead).

    at mod.require (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/require-hook.js:64:28)
    at findConfig (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js:58:20)
    at async getPostCssPlugins (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:89:18)
    at async /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/index.js:124:36
    at async Object.resolveUrlLoader (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js:60:25) {

code: 'ERR_REQUIRE_ESM'
}
```

## Attempted Fix

Try using `export` instead of `module.exports`:

```ts
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

But still erroring:

```
⨯ unhandledRejection: Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/steve/projects/recipeyak/frontend/postcss.config.js from /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js not supported.
Instead change the require of postcss.config.js in /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js to a dynamic import() which is available in all CommonJS modules.
at mod.require (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/require-hook.js:64:28)
at findConfig (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/lib/find-config.js:58:20)
at async getPostCssPlugins (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js:89:18)
at async /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/config/blocks/css/index.js:124:36
at async Object.resolveUrlLoader (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/webpack/loaders/resolve-url-loader/index.js:60:25) {
code: 'ERR_REQUIRE_ESM'
}
```

## Attempted Fix 2, delete it for now

Deleted `postcss.config.js` and end up with:

```
Error: Page "/[[...slug]]/page" is missing exported function "generateStaticParams()", which is required with "output: export" config.
```

![error about generateStaticParams not being set but required for the output: export](/assets/nextjs-install-generate-static-params-error.png)

## Attempted Fix 3, add `generateStaticParams()`

But it complains about:

```
Page "/[[...slug]]/page" cannot use both "use client" and export function "generateStaticParams()".
```

```
❯ s/dev

- yarn next dev
  yarn run v1.22.17
  \$ /Users/steve/projects/recipeyak/frontend/node_modules/.bin/next dev
  ⚠ Specified "rewrites" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
  ⚠ Specified "rewrites" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
  ▲ Next.js 14.0.3
  - Local: http://localhost:3000
  - Environments: .env

⚠ Specified "rewrites" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
⚠ Specified "rewrites" will not automatically work with "output: export". See more info here: https://nextjs.org/docs/messages/export-no-custom-routes
✓ Ready in 2.1s
○ Compiling /[[...slug]] ...
⚠ ./node_modules/ably/node_modules/ws/lib/buffer-util.js
Module not found: Can't resolve 'bufferutil' in '/Users/steve/projects/recipeyak/frontend/node_modules/ably/node_modules/ws/lib'

Import trace for requested module:
./node_modules/ably/node_modules/ws/lib/buffer-util.js
./node_modules/ably/node_modules/ws/lib/receiver.js
./node_modules/ably/node_modules/ws/index.js
./node_modules/ably/build/ably-node.js
./node_modules/@ably-labs/react-hooks/dist/mjs/AblyReactHooks.js
./node_modules/@ably-labs/react-hooks/dist/mjs/index.js
./src/queries/cookChecklistFetch.ts
./src/pages/cook-detail/CookingFullscreen.tsx
./src/pages/cook-detail/CookDetail.page.tsx
./src/components/App.tsx
./src/app/[[...slug]]/page.tsx

./node_modules/ably/node_modules/ws/lib/validation.js
Module not found: Can't resolve 'utf-8-validate' in '/Users/steve/projects/recipeyak/frontend/node_modules/ably/node_modules/ws/lib'

Import trace for requested module:
./node_modules/ably/node_modules/ws/lib/validation.js
./node_modules/ably/node_modules/ws/lib/receiver.js
./node_modules/ably/node_modules/ws/index.js
./node_modules/ably/build/ably-node.js
./node_modules/@ably-labs/react-hooks/dist/mjs/AblyReactHooks.js
./node_modules/@ably-labs/react-hooks/dist/mjs/index.js
./src/queries/cookChecklistFetch.ts
./src/pages/cook-detail/CookingFullscreen.tsx
./src/pages/cook-detail/CookDetail.page.tsx
./src/components/App.tsx
./src/app/[[...slug]]/page.tsx
⨯ Error: Page "/[[...slug]]/page" is missing exported function "generateStaticParams()", which is required with "output: export" config.
at DevServer.renderToResponseWithComponentsImpl (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:1039:27)
at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
at async DevServer.renderPageComponent (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:1852:24)
at async DevServer.renderToResponseImpl (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:1890:32)
at async DevServer.pipeImpl (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:902:25)
at async NextNodeServer.handleCatchallRenderRequest (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/next-server.js:266:17)
at async DevServer.handleRequestImpl (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:798:17) {
page: '/'
}
⚠ ./node_modules/ably/node_modules/ws/lib/buffer-util.js
Module not found: Can't resolve 'bufferutil' in '/Users/steve/projects/recipeyak/frontend/node_modules/ably/node_modules/ws/lib'

Import trace for requested module:
./node_modules/ably/node_modules/ws/lib/buffer-util.js
./node_modules/ably/node_modules/ws/lib/receiver.js
./node_modules/ably/node_modules/ws/index.js
./node_modules/ably/build/ably-node.js
./node_modules/@ably-labs/react-hooks/dist/mjs/AblyReactHooks.js
./node_modules/@ably-labs/react-hooks/dist/mjs/index.js
./src/queries/cookChecklistFetch.ts
./src/pages/cook-detail/CookingFullscreen.tsx
./src/pages/cook-detail/CookDetail.page.tsx
./src/components/App.tsx
./src/app/[[...slug]]/page.tsx

./node_modules/ably/node_modules/ws/lib/validation.js
Module not found: Can't resolve 'utf-8-validate' in '/Users/steve/projects/recipeyak/frontend/node_modules/ably/node_modules/ws/lib'

Import trace for requested module:
./node_modules/ably/node_modules/ws/lib/validation.js
./node_modules/ably/node_modules/ws/lib/receiver.js
./node_modules/ably/node_modules/ws/index.js
./node_modules/ably/build/ably-node.js
./node_modules/@ably-labs/react-hooks/dist/mjs/AblyReactHooks.js
./node_modules/@ably-labs/react-hooks/dist/mjs/index.js
./src/queries/cookChecklistFetch.ts
./src/pages/cook-detail/CookingFullscreen.tsx
./src/pages/cook-detail/CookDetail.page.tsx
./src/components/App.tsx
./src/app/[[...slug]]/page.tsx
⚠ ./node_modules/ably/node_modules/ws/lib/buffer-util.js
Module not found: Can't resolve 'bufferutil' in '/Users/steve/projects/recipeyak/frontend/node_modules/ably/node_modules/ws/lib'

Import trace for requested module:
./node_modules/ably/node_modules/ws/lib/buffer-util.js
./node_modules/ably/node_modules/ws/lib/receiver.js
./node_modules/ably/node_modules/ws/index.js
./node_modules/ably/build/ably-node.js
./node_modules/@ably-labs/react-hooks/dist/mjs/AblyReactHooks.js
./node_modules/@ably-labs/react-hooks/dist/mjs/index.js
./src/queries/cookChecklistFetch.ts
./src/pages/cook-detail/CookingFullscreen.tsx
./src/pages/cook-detail/CookDetail.page.tsx
./src/components/App.tsx
./src/app/[[...slug]]/page.tsx

./node_modules/ably/node_modules/ws/lib/validation.js
Module not found: Can't resolve 'utf-8-validate' in '/Users/steve/projects/recipeyak/frontend/node_modules/ably/node_modules/ws/lib'

Import trace for requested module:
./node_modules/ably/node_modules/ws/lib/validation.js
./node_modules/ably/node_modules/ws/lib/receiver.js
./node_modules/ably/node_modules/ws/index.js
./node_modules/ably/build/ably-node.js
./node_modules/@ably-labs/react-hooks/dist/mjs/AblyReactHooks.js
./node_modules/@ably-labs/react-hooks/dist/mjs/index.js
./src/queries/cookChecklistFetch.ts
./src/pages/cook-detail/CookingFullscreen.tsx
./src/pages/cook-detail/CookDetail.page.tsx
./src/components/App.tsx
./src/app/[[...slug]]/page.tsx
⨯ Error: Page "/[[...slug]]/page" is missing exported function "generateStaticParams()", which is required with "output: export" config.
at DevServer.renderToResponseWithComponentsImpl (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:1039:27) {
page: '/favicon.ico'
}
⨯ Error: Page "/[[...slug]]/page" is missing exported function "generateStaticParams()", which is required with "output: export" config.
at DevServer.renderToResponseWithComponentsImpl (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:1039:27) {
page: '/apple-touch-icon-precomposed.png'
}
⨯ Error: Page "/[[...slug]]/page" is missing exported function "generateStaticParams()", which is required with "output: export" config.
at DevServer.renderToResponseWithComponentsImpl (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:1039:27) {
page: '/apple-touch-icon.png'
}
⨯ Error: Page "/[[...slug]]/page" is missing exported function "generateStaticParams()", which is required with "output: export" config.
at DevServer.renderToResponseWithComponentsImpl (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/base-server.js:1039:27) {
page: '/favicon.ico'
}
⚠ Fast Refresh had to perform a full reload due to a runtime error.
⨯ Error: Page "/[[...slug]]/page" cannot use both "use client" and export function "generateStaticParams()".
at getPageStaticInfo (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/analysis/get-page-static-info.js:460:19)
at async getStaticInfoIncludingLayouts (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/entries.js:105:28)
at async /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/dev/hot-reloader-webpack.js:642:50
at async Promise.all (index 0)
at async config.entry (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/dev/hot-reloader-webpack.js:607:17)
Error: Page "/[[...slug]]/page" cannot use both "use client" and export function "generateStaticParams()".
at getPageStaticInfo (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/analysis/get-page-static-info.js:460:19)
at async getStaticInfoIncludingLayouts (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/entries.js:105:28)
at async /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/dev/hot-reloader-webpack.js:642:50
at async Promise.all (index 0)
at async config.entry (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/dev/hot-reloader-webpack.js:607:17)
Error: Page "/[[...slug]]/page" cannot use both "use client" and export function "generateStaticParams()".
at getPageStaticInfo (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/analysis/get-page-static-info.js:460:19)
at async getStaticInfoIncludingLayouts (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/build/entries.js:105:28)
at async /Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/dev/hot-reloader-webpack.js:642:50
at async Promise.all (index 0)
at async config.entry (/Users/steve/projects/recipeyak/frontend/node_modules/next/dist/server/dev/hot-reloader-webpack.js:607:17)
```

## Attempted Fix 4, remove `generateStaticParams()`

Ugh, the page doesn't automatically refresh after updating the file!

## Attempted Fix 5, search around a bit, and downgrade

Found [a related error](https://web3auth.io/community/t/nextjs-cant-resolve-bufferutil-and-utf-8-validate/5169/3) and [a bug on the next.js issue tracker](https://github.com/vercel/next.js/issues/56253)

Seems `"next": "^14.0.3"`, has this bug, and we need to downgrade to `next@13.4.19` .

But now we're getting runtime errors about data being undefined -- seems react-query isn't working.

```
TypeError: undefined is not a function (near '...teams.data.map...')

[Error] The above error occurred in the <TeamSelect> component:

TeamSelect
div
styled.div
div
styled.div
UserDropdown
div
NavButtons
nav
styled.nav
Navbar
ContainerBase
NavPage
UserHome
HomePage
Component@
sentryRoute(Route)
Route
Component@
Component@
Component@
AppRouter
Component@
ErrorBoundary
DndProvider
Component@
Le
QueryClientProvider
PersistQueryClientProvider
App
Component@
profiler(App)
NoSSR
Suspense
LoadableComponent
Page
InnerLayoutRouter
Component@
RedirectBoundary
NotFoundBoundary
LoadingBoundary
ErrorBoundary
Component@
ScrollAndFocusHandler
RenderFromTemplateContext
OuterLayoutRouter
InnerLayoutRouter
Component@
RedirectBoundary
Component@
NotFoundBoundary
LoadingBoundary
ErrorBoundary
Component@
ScrollAndFocusHandler
RenderFromTemplateContext
OuterLayoutRouter
div
body
html
Component@
RedirectBoundary
Component@
NotFoundBoundary
DevRootNotFoundBoundary
PureComponent@
HotReload
Router
Component@
ErrorBoundary
AppRouter
ServerRoot
RSCComponent
Root

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
```

## Attempted Fix 6, use a `BASE_URL` instead of rewrites

Update the http client to have a `BASE_URL` that points to `localhost:8000` while next.js runs on `localhost:3000`.

End up with a bunch of options requests which I was trying to avoid with the rewrites:

```
[03/Dec/2023 18:07:24] "OPTIONS /api/v1/recipes/recently_created HTTP/1.1" 403 58
Not Found: /api/v1/t/-1/calendar/
level=WARNING msg="Not Found: /api/v1/t/-1/calendar/" user_id=none request_id=671003da502d4e1e9eb150b22bd6676e name=django.request pathname="/Users/steve/projects/recipeyak/backend/.venv/lib/python3.11/site-packages/django/utils/log.py" lineno=224 funcname=log_response process=37918 thread=6161526784
[03/Dec/2023 18:07:24] "OPTIONS /api/v1/t/-1/calendar/?start=2023-12-03&end=2023-12-09 HTTP/1.1" 404 8530
```

## Calling it

Sun Dec 3, 1:10pm 🪦

[Failed PR for postarity](https://github.com/recipeyak/recipeyak/pull/1125) and a [previous attempt back in Dec 2021](https://github.com/recipeyak/recipeyak/pull/710).

## Conclusion

Lots of friction trying to migrate from Vite to Next.js.

I think the docs for Vite are much better than Next.js and I find the entire experience of Vite to be much more polished.

Hopefully Vite will support SSR out of the box, or Next.js catches up with Vite in terms of polish and developer experience.
