---
layout: post
title: Undoing changes to a file in a GitHub Pull Request
description: A little `git diff`, a little `git apply`
---

This isn't actually GitHub specific but I wish they'd add a button to make it easy!

Anyways, here's what I use to undo changes to a given file:

```
git diff ..origin/master your/file/here.txt | git apply
```

Or if you prefer seeing the changes as you made them

```
git diff origin/master... your/file/here.txt | git apply --reverse
```

## Some other useful git commands

### Rebasing master onto current branch without switching

```
git fetch origin master; git rebase origin/master
```

### Searching git history for a substring

```
git log -S 'some string to search'
```

Which you can also give a path and include the actual diff (`-p`)

```
git log -pS 'some string to search' your/file/or/directory
```
