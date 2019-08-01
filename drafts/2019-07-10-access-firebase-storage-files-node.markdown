---
layout: post
title:  "Access Firebase storage files in Node"
date:   2019-07-10 14:12:00
tags: [development,node,firebase]
---

In my team we're building a application where users, among other things, may upload files to display in a feed. And since we're a good and datadriven team, we wanted to gain some insights into how our users use this service.

The service itself use a firebase database to store the posts in the feed, and firebase storage to store the actual files. We store some metadata for the files in the post itself, for easy access as the client needs some of that data. This means that we need to fetch both the posts, and the files actual metadata to get our insights.

This was a POC of what kind of insights we could actually get out of it, so I exported the posts as json directly from the firebase database console to play around with.

The firebase storage doesn't seem to have this kind of functionality, meaning that I had to access the files through their API, I usually do this kinds of things in a node script, meaning that I would need to learn the firebase storage SDK for node, which proved harder than I thought. The documentation for it isn't that great (not horrible either), but the hardest part was to find documentation for the storage admin SDK, instead of the firebase database SDK, as it's sometimes hard to tell what documentation refer to which product.

## SKDS used
- Firebase admin: v8.1.0

## Resources used when finding this solution
- [https://firebase.google.com/docs/storage/admin/start](https://firebase.google.com/docs/storage/admin/start)
- [https://firebase.google.com/docs/admin/setup](https://firebase.google.com/docs/admin/setup)
- [https://stackoverflow.com/questions/47810166/cloud-storage-for-firebase-access-error-admin-storage-ref-is-not-a-functio?rq=1](https://stackoverflow.com/questions/47810166/cloud-storage-for-firebase-access-error-admin-storage-ref-is-not-a-functio?rq=1)
- [https://cloud.google.com/nodejs/docs/reference/storage/2.5.x/File](https://cloud.google.com/nodejs/docs/reference/storage/2.5.x/File)
