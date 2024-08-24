---
layout: post
title: "Swift Placeholders in Xcode"
description: "Work pretty well"
---

When autocompleting params, or running an autofix for a missing param, Xcode will insert a [placeholder token](https://developer.apple.com/documentation/swift-playgrounds/specifying-editable-regions-in-a-playground-page#Mark-Editable-Areas-with-Placeholder-Tokens):

<div style="display:flex;justify-content:center;">
<img src="/assets/xcode-placeholders-function-param.png" width="500" alt="code snippet of an partially complete function call with a placeholder for the modelContainer param">
</div>

This placeholder is well integrated into the IDE and it's also persisted to the file itself -- it's a snippet of special text:

```swift
syncStories(modelContainer: <#ModelContainer#>)
```

Since it's actual text that Xcode understands, in [doc examples you can use the same syntax to provide placeholders yourself](https://developer.apple.com/documentation/security/storing-keys-in-the-keychain#Create-a-Query-Dictionary):

```swift
let key = <# a key #>
let tag = "com.example.keys.mykey".data(using: .utf8)!
let addquery: [String: Any] = [
  kSecClass as String: kSecClassKey,
  kSecAttrApplicationTag as String: tag,
  kSecValueRef as String: key
]
```

and when you copy and paste it into Xcode you get:

<div style="display:flex;justify-content:center;">
<img src="/assets/xcode-placeholders-doc-example.png" width="500" alt="code example with a placeholder for a value">
</div>

and if you try and compile with the placeholder, Xcode highlights it with an error message, `Editor placeholder in source file`.

## Conclusion

It's Xcode only, if other editors and terminals supported placeholders, then it could be used for cases like:

```curl
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/orgs/ORG/repos
```

```js
const octokit = new Octokit({ auth: "YOUR-TOKEN" })
await octokit.request("GET /orgs/{org}/repos", {
  org: "ORG",
  headers: {
    "X-GitHub-Api-Version": "2022-11-28"
  }
})
```

```
curl https://api.mux.com/video/v1/assets \
  -X POST \
  -d '{ "input": "https://muxed.s3.amazonaws.com/leds.mp4", "playback_policy": ["public"], "encoding_tier": "baseline" }' \
  -H "Content-Type: application/json" \
  -u ${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}
```

But for now, it remains in the hands of the Apple ecosystem.
