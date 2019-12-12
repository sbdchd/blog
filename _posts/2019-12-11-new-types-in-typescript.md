---
layout: post
title: "Newtypes in TypeScript"
date: 2019-12-11
---

## Overview

Let's imagine we have a function that fetches an Organization by its `id` like follows:

```typescript
interface IOrg {
  readonly id: string
  readonly messagingService: string
  readonly createdTs: number
}

function getOrganization(id: string): IOrg {
  // ...
}
```

Let's also envision a world where our data model has the `Org['id']` set to
the `Org['messagingService']` for almost all Orgs except a couple. In this
alternative reality, we could pass in the `messagingService` as the `id` and
the `id` for the `messagingService` and we'd be fine for most Orgs, but there
is a bug. Eventually we'd get a customer complaint, but hopefully the error
reporting service would notify us first.

Ideally we'd remove the `messagingService` field and be done with it, but we
can't because it's used almost as much as the `id` field.

So how can we ensure that users of this API don't use `id` and
`messagingService` interchangeably?

## newtypes!

If we define a `newtype` for the `id` and a `newtype` for the
`messagingService` then we won't be able to pass one in place of the other.

Some languages have [`newtype`](https://wiki.haskell.org/Newtype) support
built in.

### Rust

In Rust, we can create a [single element struct
tuple](https://doc.rust-lang.org/rust-by-example/generics/new_types.html)
which serves as the `newtype`.

```rust
struct OrgId(String);

fn get_organization(id: OrgId) {
    unimplimented!()
}

fn main() {
    get_organization("foo".to_string());
    // error[E0308]: mismatched types
    //  --> src/main.rs:8:22
    //   |
    // 8 |     get_organization("foo".to_string());
    //   |                      ^^^^^^^^^^^^^^^^^ expected struct `OrgId`, found struct `std::string::String`
    //   |
    //   = note: expected type `OrgId`
    //              found type `std::string::String`

    let org_id = OrgId("foo".to_string());

    get_organization(org_id);
}
```

### Python

[Mypy also supports new types](https://mypy.readthedocs.io/en/latest/more_types.html#newtypes) like follows:

```python
from typing import NewType

OrgId = NewType('OrgId', str)

def get_organization(id: OrgId):
    ...

get_organization("foo")
# main.py:8: error: Argument 1 to "get_organization" has incompatible type "str"; expected "OrgId"
# Found 1 error in 1 file (checked 1 source file)

org_id = OrgId("foo")
get_organization(org_id)
```

### TypeScript

That's great and all but what about TypeScript?

We could use a library like:

- <https://github.com/gcanti/newtype-ts>

or we could scour the TypeScript issue tracker for solutions.

Let's look at what the issue tracker has to offer in [TypeScript#4895](https://github.com/Microsoft/TypeScript/issues/4895#issuecomment-401067935)
[(playground)](https://www.typescriptlang.org/play/index.html?ssl=10&ssc=48&pln=1&pc=1#code/CYUwxgNghgTiAEYD2A7AzgF3geQA5QEcBXEAFSgHMBlATwFsAjJCALniJQEtiE16mIAWABQoSLATi0aHPh7kKAHirwQADwwgUwGX0bMAfPADeI+PFwxOANyib4AbTyESC2vogBdNlREBfEQwaXARnHkVSABp4FXVNbV1+Q3gAXngAClJ4ADJZFzJKZQMASngAHzz5QqoDEREAenr4AFU0ShA60XBoOERUTBwYCgBJYHcBNg5uEng9AUDg0KHR1MqSRUwrFApooJCkADNBkbGkiFrhEU4UTRgDqDAEYewhkzN4OChgVAgaeE5gGwXid3o14AA6SH+ToHDhgDCcVDwCggDDAqBcABedkRKHSALYzyGDgARACSZ5SqZhOYwZDwdDLsIUWihhjONiEah0iSDkgkCTip1kOgsEhlsBVrz+ST4FAZESKKTyZ4RCz0VicdzxSdikA)

```typescript
declare const OpaqueTagSymbol: unique symbol
declare class OpaqueTag<S extends symbol> {
  private [OpaqueTagSymbol]: S
}
type Opaque<T, S extends symbol> = (T & OpaqueTag<S>) | OpaqueTag<S>

// Usage

declare const OrgIdSymbol: unique symbol
type OrgId = Opaque<string, typeof OrgIdSymbol>

interface IOrg {
  readonly id: OrgId
  // ...
}

function getOrganization(id: IOrg["id"]) {
  // ...
}

getOrganization("foo")

const orgId = "foo" as IOrg["id"]
getOrganization(orgId)
```

With this `newtype` setup we can no longer pass any variable with type
`string` for the `id` parameter, we can only pass in `IOrg["id"]`. Success! 🥳

## Conclusion

Be mindful of your data model. Let the compiler help you by using `newtype`s.
