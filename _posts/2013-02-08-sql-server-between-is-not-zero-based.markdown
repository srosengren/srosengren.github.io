---
layout: post
title:  "sql server between is not zero based"
date:   2013-02-08 14:06:00
tags: [development,sql server,gotchas,sql]
---

A small gotcha that happened a colleague tody. A simple search for paginated content went wrong.
The first page searched for items BETWEEN 0 and 10 and the second page searched for items BETWEEN 10 and 20, the first page looked alright but the first item on the second page was the same as the last one on the first page.
The reason for this is that the BETWEEN function is not zero based as most of our developer brains are, but instead it's based on row numbers. meaning that the first hit is row 1 and this is of course included in a search for 0 - 10 and that's why the first page seemed correct.