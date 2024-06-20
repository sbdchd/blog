---
layout: post
title: "Local First Image Uploads"
description: "Indexeddb and friends"
---

With a typical web app, you [can generate a presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example_s3_Scenario_PresignedUrl_section.html) and directly upload to an S3 bucket.

However, if the network is down, the upload fails.

With local first software, we want to support being offline entirely.

## Possible Solution

Without network we can:

1. [Save the image as a `Blob` to indexeddb](https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/) (`localStorage` is out because it doesn’t have enough space).

2. Upload the image once we're back online, like any other offline change.

In [Johannes Schickling's talk, "The why and how of building a local-first music app"](https://www.youtube.com/watch?v=wLGEP3zg3f8&t=768s), he describes a similar setup for handling image downloads in an offline friendly way.
