---
layout: post
title: "Web Editors"
description: "A review"
---

Before building out a playground for a language server, I decided to take a look around to see what other people are using.

| name                      | editor                             | url                                                            |
| ------------------------- | ---------------------------------- | -------------------------------------------------------------- |
| AST Explorer              | [CodeMirror][codemirror]           | https://astexplorer.net                                        |
| AWS Lambda                | [Monaco][monaco]                   | https://console.aws.amazon.com/lambda/                         |
| Black                     | [Ace][ace]                         | https://black.vercel.app/                                      |
| Checkly                   | [Monaco][monaco]                   | https://www.checklyhq.com                                      |
| Cloudflare Workers        | [Monaco][monaco]                   | https://cloudflare.com                                         |
| CodePen                   | [CodeMirror][codemirror]           | https://codepen.io                                             |
| CodeSandbox               | [Monaco][monaco]                   | https://codesandbox.io                                         |
| Compiler Explorer         | [Monaco][monaco]                   | https://godbolt.org                                            |
| DB Fiddle                 | [CodeMirror][codemirror]           | https://db-fiddle.com                                          |
| Elm Playground            | [CodeMirror][codemirror]           | https://elm-lang.org/try                                       |
| GCP Functions             | [Monaco][monaco]                   | https://console.cloud.google.com/functions/                    |
| Gleam                     | [CodeFlask][codeflask]             | https://playground.gleam.run                                   |
| Glitch                    | [CodeMirror][codemirror]           | https://glitch.com/                                            |
| Go                        | [`<textarea>`][textarea]           | https://go.dev/play/                                           |
| JS Bin                    | [CodeMirror][codemirror]           | https://jsbin.com/                                             |
| JSFiddle                  | [CodeMirror][codemirror]           | https://jsfiddle.net                                           |
| MDN Playground            | [CodeMirror][codemirror]           | https://developer.mozilla.org/en-US/play                       |
| MotherDuck                | [CodeMirror][codemirror]           | https://motherduck.com                                         |
| Neon                      | [Ace][ace]                         | https://console.neon.tech/                                     |
| Neon Playground           | [CodeMirror][codemirror]           | https://neon.tech/demos/playground                             |
| PlanetScale               | [`<textarea>`][textarea]           | https://app.planetscale.com                                    |
| Postgres Playground       | [XTerm][xterm]                     | https://www.crunchydata.com/developers/playground/             |
| Prettier                  | [CodeMirror][codemirror]           | https://prettier.io/playground/                                |
| React Compiler Playground | [Monaco][monaco]                   | https://playground.react.dev/                                  |
| Redis Docs                | [`<input type="text">`][inputtext] | https://redis.io/docs/latest/commands/hset/                    |
| Replit                    | [CodeMirror][codemirror]           | https://replit.com/                                            |
| Ruff                      | [Monaco][monaco]                   | https://play.ruff.rs                                           |
| Rust                      | [Ace][ace]                         | https://play.rust-lang.org/                                    |
| Sorbet                    | [Monaco][monaco]                   | https://sorbet.run                                             |
| SQL Fiddle                | [CodeMirror][codemirror]           | https://sqlfiddle.com                                          |
| Stripe Sigma              | [CodeMirror][codemirror]           | https://dashboard.stripe.com/sigma/queries                     |
| Swift Playground          | [Monaco][monaco], [XTerm][xterm]   | https://swiftfiddle.com                                        |
| Timescale                 | [Monaco][monaco]                   | https://console.cloud.timescale.com/dashboard/services?popsql= |
| Twilio Functions          | [Monaco][monaco]                   | https://console.twilio.com/develop/functions                   |
| TypeScript                | [Monaco][monaco]                   | https://www.typescriptlang.org/play/                           |
| typescript-eslint         | [Monaco][monaco]                   | https://typescript-eslint.io/play                              |
| val town                  | [CodeMirror][codemirror]           | https://www.val.town                                           |

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
| CodeMirror | 15    |
| Monaco     | 14    |
| Ace        | 3     |
| HTML       | 3     |
| XTerm      | 2     |
