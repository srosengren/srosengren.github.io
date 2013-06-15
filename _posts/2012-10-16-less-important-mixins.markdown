---
layout: post
title:  "Less !IMPORTANT mixins"
date:   2012-10-16 13:49:30
tags: [webb,less,mixin,css,layout,design,development]
---

I thought I should share this even though I'm generally against using !important in css rules.

Less will place an !important rule after every rule in a mixin if you write !important after the mixin name when you mix it in. This seems logical but it was something that I did not know.