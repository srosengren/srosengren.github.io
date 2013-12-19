---
layout: post
title:  "Combine knockoutjs observablearray with jQuery UI draggable and sortable"
date:   2013-11-23 16:50:00
tags: [web,knockoutjs,javascript,jquery,jqueryui,frontend,stratiteq]
---

New project, new challanges. This was one of those things that obviously isn't described in either projects documentation and some minor googling didn't turn up anything that I really liked. Well, that just means more fun for me.
What I had to accomplish was a draggable, actually a list of draggables but that's removed for brevity in this post, and a sortable list that is bound to a observablearray that keeps its items in sync with how they're visually sorted. I can honestly say that I'm not too pleased with jQuery UIs documentation. There seems to be a few missing features and the parameters for the events could use a few paragraphs that describes when certain properties are present or not.

<div id="demo" class="row">
<div class="fill">
<div id="draggable" style="cursor:pointer;color: black;border: solid 1px #ccc;display: inline-block;padding: 3px 6px;border-radius: 4px;margin: 6px 0;">Drag me to the sortable</div>
</div>
<div class="half">
sortable
<ul id="sortable" style="padding: 20px 0;border-top: solid 1px #ccc;border-bottom: solid 1px #ccc;" data-bind="foreach:elements()">
	<li style="cursor:pointer" data-bind="text:$index() + ': ' +displayName() ,attr: { 'data-index': $index }"></li>
</ul>
</div>
<div class="half">
sorted
<ul data-bind="foreach:elements">
	<li data-bind="text: $index() + ': ' +displayName()"></li>
</ul>
</div>
</div>

<script src="http://code.jquery.com/jquery-1.10.1.min.js">
</script>
<script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js">
</script>
<script src="http://cdnjs.cloudflare.com/ajax/libs/knockout/2.3.0/knockout-min.js">
</script>
<script src="/assets/scripts/knockoutdemo.js">	
</script>