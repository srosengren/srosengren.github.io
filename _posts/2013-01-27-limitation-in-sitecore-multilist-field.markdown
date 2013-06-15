---
layout: post
title:  "Limitation in Sitecore Multilist field"
date:   2013-01-27 20:01:09
tags: [web,sitecore,development,multilist]
---

There seems to be a limitation on visible items in a multilist field when settings the source as a sitecore node such as /sitecore/content/mysite. I didn't count but it seems to "only" show the first 50 subitems.

A solution for this is to instead use a sitecore query as the field source, eg **query:/sitecore/content/mysite/&#42;**

But this is not a problem that anyone is likely to encounter that often.