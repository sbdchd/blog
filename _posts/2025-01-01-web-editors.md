---
layout: post
title: "Web Editors"
description: "A review"
last_modified_at: 2025-01-03
---

Before building out a playground for a language server, I decided to take a look around to see what other people are using.

| name                                                                        | editor                             |
| --------------------------------------------------------------------------- | ---------------------------------- |
| [AST Explorer](https://astexplorer.net)                                     | [CodeMirror][codemirror]           |
| [AWS Lambda](https://console.aws.amazon.com/lambda/)                        | [Monaco][monaco]                   |
| [Black](https://black.vercel.app/)                                          | [Ace][ace]                         |
| [Checkly](https://www.checklyhq.com)                                        | [Monaco][monaco]                   |
| [Cloudflare Workers](https://cloudflare.com)                                | [Monaco][monaco]                   |
| [CodePen](https://codepen.io)                                               | [CodeMirror][codemirror]           |
| [CodeSandbox](https://codesandbox.io)                                       | [Monaco][monaco]                   |
| [Compiler Explorer](https://godbolt.org)                                    | [Monaco][monaco]                   |
| [DB Fiddle](https://db-fiddle.com)                                          | [CodeMirror][codemirror]           |
| [Elm Playground](https://elm-lang.org/try)                                  | [CodeMirror][codemirror]           |
| [GCP Functions](https://console.cloud.google.com/functions/)                | [Monaco][monaco]                   |
| [GitHub](https://github.com)                                                | [CodeMirror][codemirror]           |
| [Gleam](https://playground.gleam.run)                                       | [CodeFlask][codeflask]             |
| [Glitch](https://glitch.com/)                                               | [CodeMirror][codemirror]           |
| [Go](https://go.dev/play/)                                                  | [`<textarea>`][textarea]           |
| [JS Bin](https://jsbin.com/)                                                | [CodeMirror][codemirror]           |
| [JSFiddle](https://jsfiddle.net)                                            | [CodeMirror][codemirror]           |
| [Jupyter](https://jupyter.org/try-jupyter/lab/)                             | [CodeMirror][codemirror]           |
| [MDN Playground](https://developer.mozilla.org/en-US/play)                  | [CodeMirror][codemirror]           |
| [MotherDuck](https://motherduck.com)                                        | [CodeMirror][codemirror]           |
| [Neon Playground](https://neon.tech/demos/playground)                       | [CodeMirror][codemirror]           |
| [Neon](https://console.neon.tech/)                                          | [Ace][ace]                         |
| [PlanetScale](https://app.planetscale.com)                                  | [`<textarea>`][textarea]           |
| [Postgres Playground](https://www.crunchydata.com/developers/playground/)   | [XTerm][xterm]                     |
| [Prettier](https://prettier.io/playground/)                                 | [CodeMirror][codemirror]           |
| [React Compiler Playground](https://playground.react.dev/)                  | [Monaco][monaco]                   |
| [Redis Docs](https://redis.io/docs/latest/commands/hset/)                   | [`<input type="text">`][inputtext] |
| [Replit](https://replit.com/)                                               | [CodeMirror][codemirror]           |
| [Ruff](https://play.ruff.rs)                                                | [Monaco][monaco]                   |
| [Rust](https://play.rust-lang.org/)                                         | [Ace][ace]                         |
| [Sorbet](https://sorbet.run)                                                | [Monaco][monaco]                   |
| [SQL Fiddle](https://sqlfiddle.com)                                         | [CodeMirror][codemirror]           |
| [StackBlitz](https://stackblitz.com/edit/stylex-next?file=README.md)        | [Monaco][monaco]                   |
| [Stripe Sigma](https://dashboard.stripe.com/sigma/queries)                  | [CodeMirror][codemirror]           |
| [Swift Playground](https://swiftfiddle.com)                                 | [Monaco][monaco], [XTerm][xterm]   |
| [Timescale](https://console.cloud.timescale.com/dashboard/services?popsql=) | [Monaco][monaco]                   |
| [Twilio Functions](https://console.twilio.com/develop/functions)            | [Monaco][monaco]                   |
| [typescript-eslint](https://typescript-eslint.io/play)                      | [Monaco][monaco]                   |
| [TypeScript](https://www.typescriptlang.org/play/)                          | [Monaco][monaco]                   |
| [val town](https://www.val.town)                                            | [CodeMirror][codemirror]           |

[monaco]: https://microsoft.github.io/monaco-editor/
[codeflask]: https://www.npmjs.com/package/codeflask
[ace]: https://ace.c9.io
[codemirror]: https://codemirror.net
[xterm]: https://xtermjs.org
[textarea]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
[inputtext]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text

## Breakdown

Overall, CodeMirror and Monaco are the clear favorites:

| name       | count |
| ---------- | ----- |
| CodeMirror | 17    |
| Monaco     | 15    |
| Ace        | 3     |
| HTML       | 3     |
| XTerm      | 2     |
| CodeFlask  | 1     |
