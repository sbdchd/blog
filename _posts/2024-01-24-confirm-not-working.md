---
layout: post
title: "Confirm not working in Safari"
description: "window.confirm is a no go"
---

There's been a long standing bug with [Recipe Yak](https://recipeyak.com) where sometimes clicking `Archive` or `Delete` on a recipe doesn't do anything, and you'd need to refresh before the buttons work.

I've noticed this happening for at least a year, probably longer, and couldn't figure out why.

But I recently stumbled upon this Stack Overflow post:

<https://stackoverflow.com/questions/38083702/alert-confirm-and-prompt-not-working-after-using-history-api-on-safari-ios>

Turns out, there's a bug in Safari where `history.pushState()` breaks `alert()`, `confirm()`, and `prompt()`.

Recipe Yak uses `history.pushState()` for navigation between pages.

Kind of annoying having to reimplement `confirm()`, but better than having the buggy behavior.
