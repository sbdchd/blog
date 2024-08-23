---
layout: post
title: "SwiftData, Non-Sendable Types, and Async"
description: "Sometimes a compiler warning?"
---

I was updating my [SwiftUI](https://developer.apple.com/documentation/swiftui/) view to use [SwiftData](https://developer.apple.com/documentation/swiftdata) instead of directly storing API data in `@State`:

```swift
import SwiftData
import SwiftUI

func syncStories(modelContext: ModelContext) async throws {
  // Fetch from API and store in SwiftData
}

struct ListStoryView: View {
  @Environment(\.modelContext) private var modelContext
  @Environment(\.scenePhase) private var scenePhase
  @Query private var stories: [StoryModel]

  private func loadData() async {
    do {
      try await syncStories(modelContext : modelContext)
    } catch {
      print("errors \(error)")
    }
  }

  var body: some View {
    NavigationStack {
      List(stories) { item in
        ListStoryEntryView(item: item)
      }
      .refreshable {
        await loadData()
      }
    }
    .task(priority: .high) {
      await loadData()
    }
    .onChange(of: scenePhase) {
      if scenePhase == .active {
        Task(priority: .high) {
          await loadData()
        }
      }
    }
  }
}
```

But when running this in Simulator, it crashed almost immediately with a `EXC_BAD_ACCESS` error.

Sometimes these errors would point to the `@main` `App` struct:

![screenshot of Xcode showing an EXC_BAD_ACCESS error pointing to the App struct](/assets/swiftdata-exc-bad-access-main-struct.png)

Othertimes it would be inserting into SwiftData's [`ModelContext`](https://developer.apple.com/documentation/swiftdata/modelcontext):

![screenshot of Xcode showing an EXC_BAD_ACCESS error when calling modelContext.insert](/assets/swiftdata-exc-bad-access-model-context.png)

Or updating a property on a SwiftData [`Model`](<https://developer.apple.com/documentation/swiftdata/model()>):

![screenshot of Xcode showing an EXC_BAD_ACCESS error when updating a Model property](/assets/swiftdata-exc-bad-access-property-update.png)

I wasn't sure what was happening and then eventually I looked at the threads dropdowns and noticed that the `syncStories` function was being run on two different threads at the same time:

<div style="display:flex;justify-content:center;">
<img src="/assets/swiftdata-threads-dropdown.png" width="300" alt="screenshot of Xcode threads inspector dropdown showing syncStories running in two different threads">
</div>

So it's some sort of data race.

## The Belated Warning

**Eventually**, Xcode started showing a warning where `modelContext` was being passed into the `syncStories` function:

```
Passing argument of non-sendable type 'ModelContext' outside of main actor-isolated context may introduce data races
```

But this warning only shows up sometimes, even when the code is exactly the same!

Probably a bug in Xcode.

## The Fix

Ended up swapping out `ModelContext` for [`ModelContainer`](https://developer.apple.com/documentation/swiftdata/modelcontainer), which is [`Sendable`](https://developer.apple.com/documentation/swift/sendable):

```diff
diff --git a/view.swift b/view.swift
index 9cdd07c..903e3e9 100644
--- a/view.swift
+++ b/view.swift
@@ -80,7 +80,8 @@
-func syncStories(modelContext: ModelContainer) async throws {
+func syncStories(modelContainer: ModelContainer) async throws {
+  let modelContext = ModelContext(modelContainer)
   let stories = try await Client().postList()
   for story in stories {
     // 0. find our existing stories to upsert
@@ -151,7 +152,7 @@ struct ListStoryView: View {

   private func loadData() async {
     do {
-      try await syncStories(modelContext: modelContext)
+      try await syncStories(modelContainer: modelContext.container)
     } catch {
       // TODO:
       print("errors \(error)")
```

No more warning, no more `EXC_BAD_ACCESS`!
