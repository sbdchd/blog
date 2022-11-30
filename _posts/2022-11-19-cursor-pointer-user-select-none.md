---
layout: post
title: "cursor: pointer and user-select: none"
description: and their usage
last_modified_at: 2022-11-30
---

## cursor: pointer

I was poking around Adobe’s design library, [Spectrum](https://react-spectrum.adobe.com), and noticed it doesn't show the cursor as a [`pointer`](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor), instead it uses the `default` cursor for clickable elements.

Searching a bit led me to the [GitHub PR where they changed the cursor style from `pointer` to `initial`](https://github.com/adobe/react-spectrum/pull/449).

Why the change? Gist is native apps use `cursor: default` for buttons and interactive elements and they only use `cursor: pointer` for links, which is laid out in the human interface [guidelines from Apple](https://developer.apple.com/design/human-interface-guidelines/inputs/pointing-devices/#pointers) [and Microsoft](https://learn.microsoft.com/en-us/windows/win32/uxguide/inter-mouse?redirectedfrom=MSDN#hand-pointers).
Additionally, the spec for the `cursor: pointer` says it should be used when, ["The cursor is a pointer that indicates a link."](https://www.w3.org/TR/CSS2/ui.html#propdef-cursor)

So `cursor: default` brings the web close to a native experience.

I decided to look around for some "app like" experiences in web form and see how they handle their cursor styling:

| name            | cursor  |
| --------------- | ------- |
| Discord         | pointer |
| Dropbox         | pointer |
| Excalidraw      | pointer |
| Feedly          | pointer |
| Figma           | default |
| Google Docs     | pointer |
| iCloud          | pointer |
| iCloud Pages    | default |
| Linear          | pointer |
| music.apple.com | pointer |
| Trello          | pointer |

Also I didn't check, but I assume Adobe's online stuff uses `cursor: default` since their design library does.

## selection

In addition to using `cursor: default`, native experiences don't let you select things by default, while the web does.

So if you navigate to your bog standard page and hit <kbd>ctrl + a</kbd>, then you'll get a bunch of random boxes of content selected -- not a native experience.

![typescript github page selected via ctrl + a](/assets/typescript-github-selected.png)

So how can we avoid this?

One option is to capture the <kbd>ctrl + a</kbd> with an event handler, but this still allows for selection of random elements via the cursor / touch input.

A more robust way to prevent selection is to use our friend [`user-select: none`](https://developer.mozilla.org/en-US/docs/Web/CSS/user-select) high up in the tree and then when we actually want a user to be able to select something, we explicitly allow it with a `user-select: text`

Which sites use `user-select: none`?

| name            | uses `user-select: none`?    |
| --------------- | ---------------------------- |
| Discord         | yes                          |
| Dropbox         | no                           |
| Excalidraw      | mostly                       |
| Feedly          | sometimes (sidebar nav)      |
| Figma           | mostly                       |
| Google Docs     | sometimes (toolbars/buttons) |
| iCloud          | no                           |
| iCloud Pages    | yes                          |
| Linear          | yes                          |
| music.apple.com | yes                          |
| Trello          | yes                          |

## Conclusion

I think `cursor: default` is a good default, but even though it goes against the guidelines / spec, for clickable items I like `cursor: pointer`.

With selection, I think `user-select: none` is a good default, but with great power comes great responsibility, there are things that should be selectable!

_Update 2022-11-27_: I ended up adding these settings to Recipeyak. Took a few PRs to get it all setup:

- [recipeyak#856](https://github.com/recipeyak/recipeyak/pull/856)
- [recipeyak#858](https://github.com/recipeyak/recipeyak/pull/858)
- [recipeyak#864](https://github.com/recipeyak/recipeyak/pull/864)

## Addendum (2022-11-30): `:hover`

`:hover` is another edge case to consider when trying to get a more native feel. With browsers, `:hover` on mobile can get "stuck" enabled when using touch.

This can be easily fixed by wrapping `:hover` declarations in a `@media (hover: hover) { }`.

Defensive CSS has a [good post documenting this behavior](https://defensivecss.dev/tip/hover-media/).

Also if you're using Tailwind you can [enable `hoverOnlyWhenSupported`](https://github.com/tailwindlabs/tailwindcss/pull/8394) in the config to automatically add the media queries to hover styles.
