---
layout: post
title: "TikTok Favorites Exporter"
description: "via python, sqlite, and yt-dlp"
---

Downloading one-off videos via [yt-dlp](https://github.com/yt-dlp/yt-dlp) is pretty straightforward:

```shell
yt-dlp -o "tiktok-videos/tiktok@%(uploader)s:%(id)s:%(title).100B.%(ext)s" https://www.tiktok.com/@june_banoon/video/6979637268126420230
```

which outputs:

```
[TikTok] Extracting URL: https://www.tiktok.com/@june_banoon/video/6979637268126420230
[TikTok] 6979637268126420230: Downloading video feed
[info] 6979637268126420230: Downloading 1 format(s): bytevc1_720p_1495094-2
[download] Destination: tiktok-videos/tiktok@june_banoon:6979637268126420230:He lives down the road and we call him Mashed Potatoes #fyp #TakisTransformation #cat #catsoftiktok.mp4
[download] 100% of    2.50MiB in 00:00:00 at 8.19MiB/s
```

However, if you want to download all of your favorited videos, you'll have to do a lot of clicking around the UI to get all of the urls.

Turns out you can [get a GDPR download of all your data](https://support.tiktok.com/en/account-and-privacy/personalized-ads-and-data/requesting-your-data) which includes your favorited videos, liked videos, DMs, comments, etc. but it takes a few days to process so instead we can scrape the data!

(Also I wasn't aware this was a thing until after I got everything working D;)

## The Solution

After `Copying as cURL` and copious amounts of data munging, I arrived at [tiktoker](https://github.com/sbdchd/tiktoker) which can:

1. download your favorites metadata
2. generate a list of video urls for `yt-dlp`
3. download tiktok slide show images

It also saves the metadata to sqlite for further perusing and added robustness (an export can be paused part way through and resumed).

## Caveats

It works well so far, but there are a couple caveats:

- yt-dlp [doesn't support downloading videos marked as sensitive](https://github.com/yt-dlp/yt-dlp/issues/8678)
- no parallelization for the downloads (yt-dlp is serial, ditto for tiktoker downloading images and the favorites metadata)

## Prior Art

And after getting it all working, I found there was existing prior art in this space:

- [tiktok-save](https://github.com/samirelanduk/tiktok-save)
- [myfaveTT](https://chromewebstore.google.com/detail/myfavett-download-all-tik/gmajiifkcmjkehmngbopoobeplhoegad?pli=1)
