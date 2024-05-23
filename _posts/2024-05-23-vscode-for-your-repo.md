---
layout: post
title: "VSCode For Your Repo"
description: "Polishing dev env"
---

## Background

I recently discovered that [Insta](https://github.com/mitsuhiko/insta) has `Go to Definition` support for snapshots via a [custom VSCode extension](https://github.com/mitsuhiko/insta/tree/7e9998d5a56bae039cd4bca5fa737d6324a2a142/vscode-insta).

Also saw that [Prefab](https://prefab.cloud/features/developer-tools) has a [neat VSCode integration](https://prefab.cloud/features/developer-tools/) for feature flags.

After seeing that the latest release of VSCode includes [local workspace extensions](https://code.visualstudio.com/updates/v1_89#_local-workspace-extensions), I decided at add an [extension for Recipeyak](https://github.com/recipeyak/recipeyak/tree/6e6a3d39d73692937592df8b087637f50826e983/.vscode/extensions/recipeyak-dev).

## Creating a Repo Specific VSCode Extension

There were a couple ideas I had, mainly we could jump from the Python API endpoint definitions to their [generated callers in JS](https://steve.dignam.xyz/2024/02/11/openapi-and-codegen-for-django/), and vice versa.

### Code Lenses

I first [added some](https://github.com/recipeyak/recipeyak/pull/1458) [code lenses](https://code.visualstudio.com/api/references/vscode-api#CodeLens) to help with jumping between the client and server:

<video src="/assets/vscode-codelens.mp4" playsinline muted loop controls style="display: block; margin-left: auto; margin-right: auto; max-height: 500px; max-width: 100%"></video>

### DefinitionProvider

Then I [added support](https://github.com/recipeyak/recipeyak/pull/1477) for clicking the http path on the server and client as another way to navigate:

<video src="/assets/vscode-go-to-def.mp4" playsinline muted loop controls style="display: block; margin-left: auto; margin-right: auto; max-height: 500px; max-width: 100%"></video>

## Future

With the code lenses and the pathname navigation, we get some of the benefits that the [Relay](https://github.com/facebook/relay/pull/4434) [LSP](https://www.threads.net/@captbaritone/post/C2P7OsrOIep) & [TRPC](https://trpc.io) have, but we’re missing clicking on individual fields to get to jump between the client and server definitions.

I think for this, we’d want to use a [TypeScript language service plugin](https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin) for the client side, the server side is trickier since Pyright & Mypy don't support the same style of plugins.
