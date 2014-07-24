---
layout: post
title:  "Perfect height-width ratio in fluid css layouts"
date:   2014-07-24 10:02:00
tags: [web,css,responsive,fluid]
---

I wrote [Tily](http://www.rosengren.me/tily/), a css framework for creating fluid, perfect ratio windows8/windowsphone style tiles in web applications about a year and a half ago. It's taken this long for me to write this post explaining how it works, but hey, here it is.

Most web developers have probably at some point been tasked with building some form of gallery/grid where the height:width ratio of items were important. This was always easy when working with fixed width layout, you'd simply do 960/#items - padding and then set the height in pixels based on your ratio. It's also easy to do when all the items are img tags since these use their actual ratio to scale. But sometimes we need to add other items to our gallery/grid, and they need to scale with the rest of the items, this gets harder since we've added responsive/fluid requirements to our page/app.

Most web developers also know that `height: x%;` doesn't do quite what we think it should. So we need to find a different solution to this problem.

What we want to create is a grid of items where each item have a ratio based on its width, and it should have this ratio no matter the size of the container/browser, without creating lots of media queries and hacking a pixel based height in that way, we simply want it to be fluid percentage based.

Lets get to the code!

{% highlight html %}
<div class="tile-row">
  <span class="tile">
    <span class="tile-content">test text</span>
  </span>
  <span class="tile">
    <span class="tile-content">test text</span>
  </span>
</div>
{% endhighlight %}

This looks like a normal grid system, we've got a container element and sub items. I don't like the extra `.tile-content` element here but I'll explain why I need it when I write about the CSS block.

{% highlight css %}
.tile-row {
  font-size: 0px;
  margin-left: -12px;
}

.tile {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  width: 22.5%;
  padding-bottom: 22.5%;
  padding-left: 12px;
  font-size: 16px;
}

.tile-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 12px;
  left: 12px;
  padding: 6px;
  background: #1ba1e2;
  color: white;
}
{% endhighlight %}

I wrote about the `display: inline-block;` way of creating a grid system [here](http://www.rosengren.me/blog/whitespace-in-html-matters/). You could replace this with a normal float based grid but this is my prefered way, partly because it doesn't require a clearfix "hack".

What makes the fluid 1:1 ratio work here is that the `.tile` has the same width as it does padding-bottom, the reason for this is that all the directions of padding expressed as a percentage is based on the containing elements width, meaning that the tiles width and vertical padding (which expands the elements height) are based on the same value. We can then change these two values to get whatever ratios that we want.

About the `.tile-content` extra element. This is only really necessary when you want to position text within the tile. We can't really drop the text directly within the tile since the height of the text will effect the height of the tile. We could use a pseudo element for the padding trick but that would also mess with the total height, unless we absolutely positioned it, but that would take it out of the flow and would mess with the total layout. I would love a solution where we didn't need the extra element but I haven't found one yet.

A working jsfiddler of this can be found [here](http://jsfiddle.net/srosengren/M85n9/).