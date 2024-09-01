---
layout: post
title: "Reading URLs From the Clipboard in Swift"
description: "UIPasteboard and Alerts"
---

Apollo had this nice feature where if you had a Reddit link in your clipboard and switched to the app, it would open the link in the app.

I was exploring replicating this functionality in the lastest version of Swift & SwiftUI.

## `UIPasteboard.general.detectedPatterns`

My first attempt was using the [`UIPastboard.generate.detectedPatterns`](https://developer.apple.com/documentation/uikit/uipasteboard#3671022) method. There are a bunch of overloads, but I settled on [the async one](https://developer.apple.com/documentation/uikit/uipasteboard/3869652-detectedpatterns):

```swift
func detectedPatterns(
  for keyPaths: Set<PartialKeyPath<UIPasteboard.DetectedValues>>
) async throws -> Set<PartialKeyPath<UIPasteboard.DetectedValues>>
```

When calling the function you pass in the partial [key paths](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/expressions/#Key-Path-Expression):

```swift
let patterns = try await UIPasteboard.general.detectedPatterns(for: [\.probableWebURL])
```

I tried a few of them and [`probableWebURL`](https://developer.apple.com/documentation/uikit/uipasteboard/detectedvalues/3869645-probablewebsearch) seemed to work, until it didn't.

When copying a link from Safari's address bar manually the `probableWebURL` would detect the url as expected, but when using the copy button in the share sheet, `detectedPatterns` wouldn't find it.

So `detectedPatterns` is a no go.

## `UIPastboard.general.hasURLs`

Turns out there's a property you can check to see if the clipboard has a url: `UIPastboard.general.hasURLs`.

This works with both the manually URL copying and the share sheet copy!

Here's it wrapped up nicely:

```swift
import Foundation
import UIKit

struct Clipboard {
  private init() {}

  static func readURL() async throws -> URL? {
    if !UIPasteboard.general.hasStrings {
      return nil
    }
    if !UIPasteboard.general.hasURLs {
      return nil
    }
    if let contents = UIPasteboard.general.string {
      return URL(string: contents)
    }
    return nil
  }
}
```

and you can call it like:

```swift

if let url = try await Clipboard.readURL() {
  if url.host() == HOST_NAME {
    // TODO: implement :D
    navigateToViewFrom(url: url)
  }
}
```

## The Catch

Checking the clipboard's general content type (url, string, etc.) doesn't raise any alerts, but once you try and read from the clipboard, there's a security alert:

<div style="display:flex;justify-content:center;padding: 10px 0px;">
<img src="/assets/swift-clipboard-alert.png" width="300" alt="iOS alert asking for permission to allow the app to paste from safari">
</div>

This is asked every time unless the user changes the settings for the app.

Having the alerts as part of the flow makes it feel like a bodge.

## Conclusion: A Better Approach

Apollo later came out with another way to go from Reddit URL to in app view, a Safari browser extension.

This is a non-intrusive way to support linking into your app.

Of course, if you own the website you're making an app for, you can use [Smart App Banners](https://developer.apple.com/documentation/webkit/promoting_apps_with_smart_app_banners) & [Universal Links](https://developer.apple.com/ios/universal-links/).
