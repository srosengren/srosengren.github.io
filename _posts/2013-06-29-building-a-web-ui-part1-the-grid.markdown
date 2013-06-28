---
layout: post
title:  "Building a web UI, Part1: the grid"
date:   2013-06-29 01:06:00
tags: [web, framework, modernwebui, development, css, javascript]
---

After a year of thoughts and a few projects regarding modern UI in web applications I now feel that I've got enough material to assemble a new web framework. There might be a few other ones out there trying to accomplish the same task, but I feel that most of them are a bit to static and not responsive enought to fit all devices which is what I'm trying to create. I created [Tily](https://github.com/srosengren/tily) a while back, trying to build an incredible flexible/fluid tile system. And I feel that I did just that, but a tile system no modern UI make. This time around I'll take my time trying to get it right, starting with the basic grid.

I normally end up with a variation of the same grid when I'm building web applications since I usually require a high grade of flexiblity. My usual grid requirements, and the ones that I'll be using in this project are as follows.

-  It MUST be fluid, There's really not much to say here, a fluid grid is the way to go when building responsive applications.
-  It MUST be nestable.
-  It MUST be able to what I like to call "transform".

What I've settled on at the time of writing is a variation of the fluid 960gs. I will have half a gutter width on each side, except on nested rows for "flushness". It will not require a regular `.container > .row > .span` hierarchy, it will instead only require rows with columns in them, I will also add a utility class for the width of the outer rows. It will be transformable by the `.col-screen-*` classes that makes elements take up a different amount of columns at different screen sizes/breakpoints.

This grid (and the framework) will work in IE8 and up, I find that this is a reasonable baseline in 2013.