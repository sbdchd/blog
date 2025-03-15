---
layout: post
title: "Web Editors"
description: "A review"
last_modified_at: 2025-03-15
---

Before building out a playground for a language server, I decided to take a look around to see what other people are using.

| name                                                                              | editor                             |
| --------------------------------------------------------------------------------- | ---------------------------------- |
| [AST Explorer Dev](https://ast-explorer.dev/)                                     | [Monaco][monaco]                   |
| [AST Explorer Net](https://astexplorer.net)                                       | [CodeMirror][codemirror]           |
| [AWS Athena](http://console.aws.amazon.com/athena)                                | [Ace][ace]                         |
| [AWS CloudShell](https://console.aws.amazon.com/cloudshell/)                      | [Ace][ace]                         |
| [AWS Lambda](https://console.aws.amazon.com/lambda/)                              | [Monaco][monaco]                   |
| [AWS Redshift](https://console.aws.amazon.com/sqlworkbench/home)                  | [Monaco][monaco]                   |
| [Biome](https://biomejs.dev/playground/)                                          | [CodeMirror][codemirror]           |
| [Black](https://black.vercel.app/)                                                | [Ace][ace]                         |
| [CEL Playground](https://playcel.undistro.io)                                     | [Ace][ace]                         |
| [Checkly](https://www.checklyhq.com)                                              | [Monaco][monaco]                   |
| [ClickHouse Query](https://play.clickhouse.com/play)                              | [`<textarea>`][textarea]           |
| [Cloudflare Workers](https://cloudflare.com)                                      | [Monaco][monaco]                   |
| [CodePen](https://codepen.io)                                                     | [CodeMirror][codemirror]           |
| [CodeSandbox](https://codesandbox.io)                                             | [Monaco][monaco]                   |
| [Compiler Explorer](https://godbolt.org)                                          | [Monaco][monaco]                   |
| [Databricks](https://www.databricks.com)                                          | [Monaco][monaco]                   |
| [DB Fiddle](https://db-fiddle.com)                                                | [CodeMirror][codemirror]           |
| [Deno Deploy](https://dash.deno.com)                                              | [Monaco][monaco]                   |
| [EDA Playground](https://edaplayground.com)                                       | [CodeMirror][codemirror]           |
| [Elm Playground](https://elm-lang.org/try)                                        | [CodeMirror][codemirror]           |
| [esbuild try](esbuild.github.io/try/)                                             | [`<textarea>`][textarea]           |
| [ESLint Playground](https://eslint.org/play/)                                     | [CodeMirror][codemirror]           |
| [GCP Cloud Shell Editor](https://console.cloud.google.com/cloudshelleditor)       | [Monaco][monaco]                   |
| [GCP Cloud Shell Terminal](https://console.cloud.google.com/cloudshelleditor)     | [Xterm][xterm]                     |
| [GCP Functions](https://console.cloud.google.com/functions/)                      | [Monaco][monaco]                   |
| [GitHub](https://github.com)                                                      | [CodeMirror][codemirror]           |
| [Gleam](https://playground.gleam.run)                                             | [CodeFlask][codeflask]             |
| [Glitch](https://glitch.com/)                                                     | [CodeMirror][codemirror]           |
| [Go](https://go.dev/play/)                                                        | [`<textarea>`][textarea]           |
| [Hakana](https://hakana.dev)                                                      | [CodeMirror][codemirror]           |
| [Heroku Dataclips](https://data.heroku.com/dataclips/create)                      | [Monaco][monaco]                   |
| [JS Bin](https://jsbin.com/)                                                      | [CodeMirror][codemirror]           |
| [JSFiddle](https://jsfiddle.net)                                                  | [CodeMirror][codemirror]           |
| [Jupyter](https://jupyter.org/try-jupyter/lab/)                                   | [CodeMirror][codemirror]           |
| [Kotlin Playground](https://play.kotlinlang.org/)                                 | [CodeMirror][codemirror]           |
| [Lightning CSS Playground](https://lightningcss.dev/playground/)                  | [CodeMirror][codemirror]           |
| [Limber](https://limber.glimdown.com/)                                            | [CodeMirror][codemirror]           |
| [MDN Playground](https://developer.mozilla.org/en-US/play)                        | [CodeMirror][codemirror]           |
| [MiniJinja Playground](https://mitsuhiko.github.io/minijinja-playground/)         | [Ace][ace]                         |
| [Monaco Playground](https://microsoft.github.io/monaco-editor/playground.html)    | [Monaco][monaco]                   |
| [MotherDuck](https://motherduck.com)                                              | [CodeMirror][codemirror]           |
| [mypy Playground](https://mypy-play.net/)                                         | [Ace][ace]                         |
| [Neon Playground](https://neon.tech/demos/playground)                             | [CodeMirror][codemirror]           |
| [Neon](https://console.neon.tech/)                                                | [Ace][ace]                         |
| [Nim Playground](https://play.nim-lang.org/)                                      | [CodeMirror][codemirror]           |
| [Observable](https://observablehq.com/)                                           | [CodeMirror][codemirror]           |
| [Parcel Repl](https://repl.parceljs.org)                                          | [CodeMirror][codemirror]           |
| [ParserTL Playground](https://mingodad.github.io/parsertl-playground/playground/) | [Ace][ace]                         |
| [PlanetScale](https://app.planetscale.com)                                        | [`<textarea>`][textarea]           |
| [Porffor](https://porffor.dev)                                                    | [Monaco][monaco]                   |
| [Postgres Playground](https://www.crunchydata.com/developers/playground/)         | [XTerm][xterm]                     |
| [Prettier](https://prettier.io/playground/)                                       | [CodeMirror][codemirror]           |
| [Psalm](https://psalm.dev)                                                        | [CodeMirror][codemirror]           |
| [Pyright Playground](https://pyright-play.net/)                                   | [Monaco][monaco]                   |
| [React Compiler Playground](https://playground.react.dev/)                        | [Monaco][monaco]                   |
| [Redis Docs](https://redis.io/docs/latest/commands/hset/)                         | [`<input type="text">`][inputtext] |
| [Replit](https://replit.com/)                                                     | [CodeMirror][codemirror]           |
| [Ruff](https://play.ruff.rs)                                                      | [Monaco][monaco]                   |
| [RunKit](https://npm.runkit.com/react)                                            | [CodeMirror][codemirror]           |
| [Rust](https://play.rust-lang.org/)                                               | [Ace][ace]                         |
| [Shadertoy](https://www.shadertoy.com/view/Xds3zN)                                | [CodeMirror][codemirror]           |
| [SingleStore](https://www.singlestore.com)                                        | [Monaco][monaco]                   |
| [Snowflake](https://www.snowflake.com/)                                           | [CodeMirror][codemirror]           |
| [Sorbet](https://sorbet.run)                                                      | [Monaco][monaco]                   |
| [SQL Fiddle](https://sqlfiddle.com)                                               | [CodeMirror][codemirror]           |
| [StackBlitz](https://stackblitz.com/edit/stylex-next?file=README.md)              | [Monaco][monaco], [XTerm][xterm]   |
| [Stripe Sigma](https://dashboard.stripe.com/sigma/queries)                        | [CodeMirror][codemirror]           |
| [SWI Prolog](https://swish.swi-prolog.org)                                        | [CodeMirror][codemirror]           |
| [Swift Playground](https://swiftfiddle.com)                                       | [Monaco][monaco], [XTerm][xterm]   |
| [Tailwind Play](https://lightningcss.dev/playground/)                             | [Monaco][monaco]                   |
| [Timescale](https://console.cloud.timescale.com/dashboard/services?popsql=)       | [Monaco][monaco]                   |
| [Tinybird](https://www.tinybird.co)                                               | [CodeMirror][codemirror]           |
| [Twilio Functions](https://console.twilio.com/develop/functions)                  | [Monaco][monaco]                   |
| [typescript-eslint](https://typescript-eslint.io/play)                            | [Monaco][monaco]                   |
| [TypeScript](https://www.typescriptlang.org/play/)                                | [Monaco][monaco]                   |
| [val town](https://www.val.town)                                                  | [CodeMirror][codemirror]           |

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
| CodeMirror | 33    |
| Monaco     | 26    |
| Ace        | 9     |
| HTML       | 4     |
| XTerm      | 4     |
| CodeFlask  | 1     |
