---
layout: post
date: 2019-05-13
title: "Python's Pathlib in Swift"
---

In Swift we can use [Foundation](https://developer.apple.com/documentation/foundation/)'s [`URL` struct](https://developer.apple.com/documentation/foundation/url) to construct paths, but this API is a bit verbose for my taste.

```swift
// .
// └── Project
//     ├── Foo.swift
//     └── foo
//         └── bar
//             └── bizz

// in Foo.swift

// construct path
let path = (
    URL(fileURLWithPath: #file)
    .deletingLastPathComponent()
    .appendingPathComponent("foo")
    .appendingPathComponent("bar")
    .appendingPathComponent("bizz")
)
assert(path == "~/Project/foo/bar/bizz")

// check if the path exists
let pathExists = try? URL(fileURLwithPath: #file).checkResourceIsReachable() != nil
```

## Pathlib

Python's older `os.path` library suffers similar issues with verbosity, but the newer [pathlib](https://docs.python.org/3/library/pathlib.html#operators) library provides a clean API by adding some additional methods and overloading the division operator.

To replicate the `Foo.swift` path above in Python we can do the following:

```python
path = Path(__file__).parent / "foo" / "bar" / "bizz"
# And to check path existence
path.exists()
```

Short and simple.

## Extension

We can add a pathlib style API to `URL` with an [`extension`](https://docs.swift.org/swift-book/LanguageGuide/Extensions.html).

```swift
extension URL {
    func exists() -> Bool {
        return (try? self.checkResourceIsReachable()) != nil
    }

    var parent: URL {
        return self.deletingLastPathComponent()
    }

    static func / (lhs: URL, rhs: String) -> URL {
        return lhs.appendingPathComponent(rhs, isDirectory: false)
    }
}
```

Now we can write our Swift paths like our Python paths.

```swift
// replacing
let path = (
    URL(fileURLWithPath: #file)
    .deletingLastPathComponent()
    .appendingPathComponent("foo")
    .appendingPathComponent("bar")
    .appendingPathComponent("bizz")
)
let pathExists = try? path.checkResourceIsReachable() != nil
// with
let path = URL(fileURLWithPath: #file).parent / "foo" / "bar" / "bizz"
let pathExists = path.exists()
```
