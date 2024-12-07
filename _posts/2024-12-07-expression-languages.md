---
layout: post
title: "Expression Languages"
description: "CEL, NSPRedicate, JSON DSLs"
---

Sometimes you want configurability without the baggage of an entire language, so you turn to an simple, expression language!

Here are some examples I've found.

## CEL

Used in [Firebase for ACL definitions](https://firebase.google.com/docs/rules/rules-language), there are a couple implementations hanging around but go is the main one. They also [have a spec](https://github.com/google/cel-spec).

```go
// Condition
account.balance >= transaction.withdrawal
    || (account.overdraftProtection
    && account.overdraftLimit >= transaction.withdrawal  - account.balance)

// Object construction
common.GeoPoint{ latitude: 10.0, longitude: -5.5 }
```

## NSPredicate

Apple uses [`NSPredicate`](https://developer.apple.com/documentation/foundation/nspredicate) for configuring things like extension activation logic.

They have [extensive docs](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Predicates/Articles/pSyntax.html) for it, I've mostly seen it serialized inside plists.

```
SUBQUERY (
  extensionItems,
  $extensionItem,
  SUBQUERY (
    $extensionItem.attachments,
    $attachment,
    ANY $attachment.registeredTypeIdentifiers UTI-CONFORMS-TO "public.url"
  ).@count > 0
).@count > 0
```

## Figma's JSON DSL

Figma built a [JSON DSL to define ACLs for their permission system](https://www.figma.com/blog/how-we-rolled-out-our-own-permissions-dsl-at-figma/), similar to how Firebase uses CEL.

```json
{
  "and": {
    ["team.id", "<>", null],
    ["file.id", "=", { "ref": "team.id" }]
  }
}
```

```js
{ // Data
  "team": {
    "permission": "secret"
  },
  "file": PENDING_LOAD,  // We have not attempted to load this row!
  "project": PENDING_LOAD,
}

{ // ExpressionDef
  "and": [ // false
    ["file.id", "<>", null], // ?
    ["team.permission", "=", "open"], // false
    ["project.deleted_at", "<>", null], // ?
  ]
}
```

## Watchman JSON DSL

For querying [watchman](https://facebook.github.io/watchman) you can use its [JSON based DSL](https://facebook.github.io/watchman/docs/cmd/query) to construct query predicates.

```shell
$ watchman -j <<-EOT
["query", "/path/to/root", {
  "suffix": "php",
  "expression": ["allof",
    ["type", "f"],
    ["not", "empty"],
    ["ipcre", "test", "basename"]
  ],
  "fields": ["name"]
}]
EOT
```

## Conclusion

Lots of good options, a basic JSON based solution will get you pretty far!
