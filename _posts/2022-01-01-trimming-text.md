---
layout: post
title: Trimming Text
description: "-webkit-line-clamp enhanced"
---

Let's imagine we have some some user provided text that we want to clip and render a
`show more` button when it's longer than some length `n`.

## Solutions

### [`.slice(0, n)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice)

The first thought might be to slice the string, but this [doesn't play well
with unicode](https://steve.dignam.xyz/2018/08/08/handling-strings/):


```js
"The Black Pearl sailed the mighty seas 🏴‍☠️".slice(0, 40)
> 'The Black Pearl sailed the mighty seas \ud83c'
```

So it's out.


### [`max-height`](https://developer.mozilla.org/en-US/docs/Web/CSS/max-height)

We could set the `max-height` on our text to some `px` value that looks good,
but then we'd need to make sure we work in a ratio of our font height. Anyways,
we could make it work, but there's an easier way!


### [`-webkit-line-clamp`](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-line-clamp)

A nifty property that, despite its prefix, is supported by [most browsers](https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-line-clamp#browser_compatibility).


Usage is pretty straight forward:

```css
.trimmed-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
```

```html
<div class="trimmed-text">Lorem ipsum dolor etc.</div>
```

Which looks something like this:


<style>
.trimmed-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;

  margin-right: auto;
  margin-left: auto;
}

.center {
  margin-right: auto;
  margin-left: auto;
  max-width: 400px;
}
</style>


<p class="trimmed-text center">
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas magna purus, sollicitudin ut pellentesque vitae, posuere nec lectus. Sed tempus diam massa, vel luctus libero venenatis at. Integer convallis aliquet mauris. Sed nulla justo, ultrices id purus eu, hendrerit rhoncus nulla. Praesent semper eros vitae diam facilisis efficitur.

</p>

Looks great but we're missing the `show more` button.

Straightfoward enough, a few extra `id`s and an `onclick` and we're on our way:

```ts
function handleClick() {
  const button = document.getElementById("toggle-button")
  const text = document.getElementById("text")
  if (showMoreButton.textContent === "show more") {
    text.classList.remove("trimmed-text")
    button.textContent = "show less"
  } else {
    text.classList.add("trimmed-text")
    button.textContent = "show more"
  }
}
```


<p id="text" class="trimmed-text center">
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas magna purus, sollicitudin ut pellentesque vitae, posuere nec lectus. Sed tempus diam massa, vel luctus libero venenatis at. Integer convallis aliquet mauris. Sed nulla justo, ultrices id purus eu, hendrerit rhoncus nulla. Praesent semper eros vitae diam facilisis efficitur.

</p>


<div style="display: flex; margin: 10px;">
  <button id="show-more" class="center" onclick="handleClick()">show more</button>
</div>

<script>
function handleClick() {
  const showMoreButton = document.getElementById("show-more")
  const text = document.getElementById("text")
  if (showMoreButton.textContent === "show more") {
    text.classList.remove("trimmed-text")
    showMoreButton.textContent = "show less"
  } else {
    text.classList.add("trimmed-text")
    showMoreButton.textContent = "show more"
  }
}
</script>


Also, we only want to show the `show more` button if the text is actually being clipped. With some extra JS we can hide/show the button appropriately:

```ts
const hasOverflow = (el: HTMLElement) => el.scrollHeight > el.clientHeight

// in some on load function & whenever the width of the window changes
const button = document.getElementById("toggle-button")
const text = document.getElementById("text")
if (hasOverflow(text)) {
  button.style.display = "block"
} else {
  button.style.display = "none"
}
```

## Prior Art

[YouTube](https://www.youtube.com/watch?v=jNQXAC9IVRw) uses `-webkit-line-clamp` for their comments, but they don't recalculate the
clipping when the window size changes.

This causes a couple of bugs.

1. If you open a YouTube video at a desktop size viewport, so clipping doesn't
   occur, then shrink the width of the page, the text will clip without the `show
   more` button appearing, meaning there is no way to see the rest of the comment.

2. The reverse can happen when opening at a small viewport and expanding to a
   large viewport. The `show more` button is visible on the desktop size, but
   the text isn't being clipped.

[NYT Cooking](https://cooking.nytimes.com/recipes/1021230-creamy-avocado-pesto-pasta) uses the `max-height` setup for the recipe descriptions in a mobile
browser. They also use some JS & media queries to ensure the `More +` button
doesn't show on wide viewports.
