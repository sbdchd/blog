---
layout: post
title: "LSP Server Document Sync"
description: "Incremental or bust"
---

When setting up an LSP Server you're presented with a [choice for document syncing](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocumentSyncKind): Full or Incremental.

Starting off with full seems like the right choice. You don't have to worry about keeping track of the document state and applying the [incremental updates](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_didChange).

But this comes at the cost of responsiveness.

The full document sync updates are [debounced](https://developer.mozilla.org/en-US/docs/Glossary/Debounce) and will not be sent on each key press. This means it can take an unknown amount of time before your document changes are sent to the LSP server.

## Examples

### Full Sync

With the full sync, we can see the delay between typing and the messages received by the LSP server.

<video src="/assets/lsp-server-sync-full.mp4" playsinline muted loop controls style="display: block; margin-left: auto; margin-right: auto; max-height: 500px; max-width: 100%"></video>

### Incremental Sync

When we switch to incremental, we can see how each key press sends a message to the server.

<video src="/assets/lsp-server-sync-incremental.mp4" playsinline muted loop controls style="display: block; margin-left: auto; margin-right: auto; max-height: 500px; max-width: 100%"></video>

## Conclusion

Use incremental sync for your LSP server.
