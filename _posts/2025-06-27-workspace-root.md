---
layout: post
title: "Workspace Root"
description: "A review"
---

## Bazel

`//` [indicates relative to the current workspace](https://bazel.build/run/build#specifying-build-targets)

## Buck2

`//` [has similar behavior to Bazel's](https://buck2.build/docs/concepts/build_target/#fully-qualified-build-targets)

## Git

`:/` is the [root of the working tree](https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-aiddefpathspecapathspec)

## JSONSchema

`#/` is a JSON pointer's way of [representing document root](https://datatracker.ietf.org/doc/html/draft-bhutton-json-schema-00#appendix-A)

## Ruby

`::` to access top level scope:

```ruby
class File end
# access global `File` instead of module level `File`
file = ::File.open("myfile.txt")
```

## Absolute File Paths

`/` as in `cat /foo.txt`

## Absolute URLS

`//` as in `<a href="//foo">foo</a>`
