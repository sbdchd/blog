---
layout: post
title: "Blurhash or Downscaled and Blurred"
description: Quality vs storage
---

<script type="module">

import {decode, encode} from 'https://unpkg.com/blurhash@2.0.4/dist/index.mjs';

// used https://blurha.sh
const vincentEncoded = 'LGAv:-Or0#%L%Kf6Ips-EgoL-AS2';

const width = 100;
const height = width;
const pixels = decode(vincentEncoded, width, height);


document.querySelectorAll("[data-blurhash-target]").forEach((el) => {
    const canvas = document.createElement("canvas");
    canvas.width = width
    canvas.height = height
    canvas.style.borderRadius = "3px";
    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
    el.appendChild(canvas);
});


document.querySelectorAll("[data-animate-vis]").forEach((el) => {
    const animate = () => {
        if (!el.style.visibility || el.style.visibility === "visible") {
            console.log("making hidden")
            el.style.visibility = "hidden";
            el.parentElement.style.border = "1px solid gray";
        } else {
            console.log("making visible")
            el.style.visibility = "visible";
            el.parentElement.style.border = "1px solid transparent";
        }
    }
    animate()
    setInterval(animate, 3000)

});

document.getElementById("toggle-bg").onclick = () => {
    if (document.querySelector("[data-toggle-bg]").style.backgroundColor !== "white") {
        document.querySelector("[data-toggle-bg]").style.backgroundColor = "white"
    } else {
        document.querySelector("[data-toggle-bg]").style.backgroundColor = "inherit"
    }
}

</script>

<style>
.placeholder {
    height: 100px;
    width: 100px;
    border-radius: 3px;
    object-fit: cover;
    -webkit-filter: unset;
    filter: unset;
}

.blur {
    filter: blur(6px);
}

.scale {
    scale: 1.2;
}

.placeholder-wrapper {
    overflow: hidden;
    border-radius: 3px;
    height: 100px;
    width: 100px;
}

.blurred-filter::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  pointer-events: none;
}

.blurred-filter {
    height: 100px;
    width: 100px;
    object-fit: cover;
    position: relative;
    background: no-repeat center center;
    background-size: cover;
    background-image: url("/assets/vincent-small.jpeg")

}

.top-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    grid-gap: 0.5rem;
}

.d-flex {
    display: flex;
}

pre {
    margin-top: 1rem;
}
</style>

<div style="">
<div class="top-wrapper">
<div><img src="/assets/vincent-original.jpeg" class="placeholder "/></div>
<div><img src="/assets/vincent-small.jpeg" class="placeholder "/></div>
<div class=""><img src="/assets/vincent-small.jpeg" class="placeholder blur"/></div>
<div class="placeholder-wrapper"><img src="/assets/vincent-small.jpeg" class="placeholder border blur"/></div>
<div class="placeholder-wrapper"><img src="/assets/vincent-small.jpeg" class="placeholder border blur scale"/></div>
<div src="/assets/vincent-small.jpeg" class="placeholder blurred-filter"></div><div data-blurhash-target class="d-flex"></div>
</div>
</div>

## Overview

When loading images on the web, at a minimum you need to set height and width, which gives you an empty placeholder when the image loads while preventing layout shift.

<div style="border: 1px solid gray;height: 98px; width: 98px">
<img data-animate-vis src="/assets/vincent-original.jpeg" class="placeholder"/>
</div>

But we can do better than an empty placeholder.

The options I've found are:

- leave off height & width and suffer layout shift
- include height & width and get an empty placeholder
- skeleton loader, like Discord & Facebook
- [blurhash](https://github.com/woltapp/blurhash), like Signal
- placeholder image, like Slack & Instagram

For this post we're going to compare blurhash and placeholder images as they're the most visually pleasing of the bunch.

## Placeholder Images

With placeholder images, you return an inline image with your API response along with the normal image url.
You then render both inline and normal images and use some CSS to make the placeholder image not look wonky.

So instead of just having an API response like:

```json
{
  "id": 1,
  "profile_url": "..."
}
```

You'll have an additional inline, base64 image:

```json
{
  "id": 1,
  "profile_url": "...",
  "profile_preview": "data:image/jpg;base64,..."
}
```

With the base64 image, it's a trade off with storage and quality; too large, and you're bloating the database, too
small, and the placeholder looks wrong.

### original

<img src="/assets/vincent-original.jpeg" class="placeholder"/>

```html
<img src="/assets/vincent-original.jpeg" class="placeholder" />
```

What the `<img` would load, but it can take a while if it's not in cache/CDN. S3 p99s aren't great!

### low res, no blur

<img src="/assets/vincent-small.jpeg" class="placeholder"/>

```html
<img src="/assets/vincent-small.jpeg" class="placeholder" />
```

A `690 byte` JPEG that's 33px by 42px.

This is just to show what the downscaled image looks like, not something you'd actually use.

When we base64 it we get:

```
data:image/jpg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAqACEDASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAAAAEDBAUGBwL/xAAsEAACAQMDAgQFBQAAAAAAAAABAhEAAwQFEjEhYQYUQVETIjJxoVKRscHS/8QAFwEBAQEBAAAAAAAAAAAAAAAAAwQCAf/EAB8RAAICAgIDAQAAAAAAAAAAAAABAgMREgQhEzFRIv/aAAwDAQACEQMRAD8AwN5iCxnknpPFN2LN3IeEaI5mvOQsXjJPeK1vhG/gYWM1y+qPeB3EBZIX1P8AFZsnpDK9k9Ve9mM9FHmaBqGNjLfKObZ9dsVT3kvY9za6MpAnmuy52r4uoaTet2HUynQkcd4rkOq/Ft5e1yzA/MCfUGiotlPqRVdUorKIvxx3oo3CinwDgmXFLO5JEzV54e1W3hORctgyNoPaR6etVW2d3PNGHfuWswLaY7mBCwYJI60d62rwjvCetuX6NfkajtuW8fH2G07cxBj2rDatlnLz2faAiEooHAANaHOvW9M0/o4u6rlCWUdfL2/9H8VlzackiCI5+9Dx4afqRbybFYlGAzP2opfLH2P7UVZmP0i8cvhc3Ds3EdCDUIs6XUYfUp3KB71b3UQrjSqmS0yOeoqu2qbt6QPp9u9E32bpWIgiM+9yxZ2Mlu9KiwCCDuHTrUhAPLEwJBH90l1RCiBE0bYqGfLt+j80Usn3NFcNn//Z
```

which is `942 bytes`, still small enough to fit in your bog standard database row.

With a little Python and [PIL](https://pillow.readthedocs.io/en/stable/) we can get our downsized image as base64:

```python
from typing import Protocol
from pathlib import Path
from io import BytesIO
import base64

from PIL import Image


def get_placeholder_image(image: BytesIO) -> str:
    with Image.open(image) as im:
        im.thumbnail((42, 42))
        buf = BytesIO()
        im.save(buf, optimize=True, format="jpeg")
        img_str = base64.b64encode(buf.getvalue())
        return (b"data:image/jpg;base64," + img_str).decode()


if __name__ == "__main__":
    image_data = Path("vincent-original.jpeg").read_bytes()
    print(get_placeholder_image(BytesIO(image_data)))
```

### low res, blur

<img src="/assets/vincent-small.jpeg" class="placeholder blur"/>

```html
<style>
  .placeholder {
    height: 100px;
    width: 100px;
    border-radius: 3px;
    object-fit: cover;
    filter: unset;
    -webkit-filter: unset;
  }

  .blur {
    filter: blur(6px);
  }
</style>

<img src="/assets/vincent-small.jpeg" class="placeholder blur" />
```

The first step to making the placeholder look nicer is applying a blur, but not so fast!
The blur flows outside the image border.

### low res, blur + wrapper with overflow:hidden

<div class="placeholder-wrapper" data-toggle-bg style="background-color: white">
    <img src="/assets/vincent-small.jpeg" class="placeholder blur"/>
</div>

<label style="user-select: none; -webkit-user-select: none;">
<input type="checkbox" checked id="toggle-bg">
toggle background
</label>

```html
<style>
  .placeholder {
    height: 100px;
    width: 100px;
    border-radius: 3px;
    object-fit: cover;
    filter: unset;
    -webkit-filter: unset;
  }

  .blur {
    filter: blur(6px);
  }

  .placeholder-wrapper {
    overflow: hidden;
    border-radius: 3px;
    height: 100px;
    width: 100px;
  }
</style>

<div class="placeholder-wrapper" style="background-color: white">
  <img src="/assets/vincent-small.jpeg" class="placeholder blur" />
</div>
```

So we add a wrapper `<div` and it gives us that crisp edge, but the background bleeds into the blur, which messes with the image.

On a dark background it's hard to notice, but it sticks out on a light background.

### low res, blur, scale + wrapper with overflow:hidden

<div class="placeholder-wrapper">
    <img src="/assets/vincent-small.jpeg" class="placeholder blur scale"/>
</div>

```html
<style>
  .placeholder {
    height: 100px;
    width: 100px;
    border-radius: 3px;
    object-fit: cover;
    filter: unset;
    -webkit-filter: unset;
  }

  .blur {
    filter: blur(6px);
  }

  .placeholder-wrapper {
    overflow: hidden;
    border-radius: 3px;
    height: 100px;
    width: 100px;
  }

  .scale {
    scale: 1.2;
  }
</style>

<div class="placeholder-wrapper" style="background-color: white">
  <img src="/assets/vincent-small.jpeg" class="placeholder blur scale" />
</div>
```

One solution to the background bleed issue is to scale the image so the edges get cut off.

But by expanding the image it doesn't line up with the actual image that gets loaded.

We can do better!

### low res, blur, ::after with backdrop-filter

<div src="/assets/vincent-small.jpeg" class="placeholder blurred-filter"></div>

```html
<style>
  .blurred-filter::after {
    content: "";
    position: absolute;
    height: 100%;
    width: 100%;
    border-radius: 3px;
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    pointer-events: none;
  }

  .blurred-filter {
    height: 100px;
    width: 100px;
    border-radius: 3px;
    object-fit: cover;
    position: relative;
    background: no-repeat center center;
    background-size: cover;
    background-image: url("/assets/vincent-small.jpeg");
  }
</style>

<div src="/assets/vincent-small.jpeg" class="blurred-filter"></div>
```

Instead of scaling the image, we can use `backdrop-filter` which produces the perfect blur!

Caveat is [old browsers don't support this](https://caniuse.com/css-backdrop-filter), so if you're shackled to IE, you'll have to use the scale solution.

## blurhash

<div data-blurhash-target></div>

```js
import { decode, encode } from "https://unpkg.com/blurhash@2.0.4/dist/index.mjs"

// used https://blurha.sh
const vincentEncoded = "LGAv:-Or0#%L%Kf6Ips-EgoL-AS2"

const width = 100
const height = width
const pixels = decode(vincentEncoded, width, height)

const el = document.getElementById("[data-blurhash-target]")

const canvas = document.createElement("canvas")
canvas.width = width
canvas.height = height
canvas.style.borderRadius = "3px"
const ctx = canvas.getContext("2d")

const imageData = ctx.createImageData(width, height)
imageData.data.set(pixels)
ctx.putImageData(imageData, 0, 0)
el.appendChild(canvas)
```

Now that we have the perfect blurred placeholder image, we can compare against a blurhash.

When we plug in our original image into the blurhash encoder we get:

```
LGAv:-Or0#%L%Kf6Ips-EgoL-AS2
```

which produces the above image when decoded.

I think the downscaled & blurred placeholder images look nicer, but this is only `28 Bytes` vs the `1 KB` for the inline placeholder images, so if you're optimizing for space, `blurhash` is for you!

## Conclusion

Blurhash isn't great but if you're going for the smallest payload that lets you have a placeholder image, then it's fine.

If you're willing to up your storage, then using a downscaled & blurred image will leave you with a nicer aesthetic.
