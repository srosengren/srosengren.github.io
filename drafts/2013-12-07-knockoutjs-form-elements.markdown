---
layout: post
title:  "KnockoutJS and form elements"
date:   2013-12-07 10:28:00
tags: [web,knockoutjs,javascript,frontend,stratiteq]
---

One of the latest projects that i've been involved with at Stratiteq was a form designer web application where I was tasked with setting up the frontend architecture and building the form designer itself. I decided on using [KnockoutJS](http://knockoutjs.com/) since i've built applications with it before and find it to be an extremely competent MV* framework.

One of the reasons for choosing Knockout is because of their great documentation which can be found [here](http://knockoutjs.com/documentation/introduction.html), the documentation for working with form elements is excellent and they cover things like enable, value, checked and lots of bindings for options in select elements. But us developers have a way of trying to build things that the documentation doesn't cover explicitly and I think that's part of the beauty of our work.

## HTML select
#### Dynamically switch between multiple or not
One of the elements that the user should be able to create is a listbox, i.e., a select element with either a multiple attribute or size attribute > 1, the form creator should also be able to switch between multiple or not. The issue here was that only the last item was rendered as selected when I tried to render a list that was set to allow multiple and had multiple items set as selected. Here's the code that I had when this issue presented itself

{% highlight html %}
<select data-bind="foreach: items,attr: { multiple: multiple}" disabled>
    <option data-bind="text:text,value:value,attr: {selected:selected }"></option>
</select>
{% endhighlight %}

The reason for not using the options* values that Knockout provides is that I also needed some more specific rendering control over the options that isn't displayed in this snippet.

This issue was fortunately very easy to find. Knockout renders the data-bind params from left to right, meaning that all the items with their selected attributes were written before the multiple attribute was set on the select itself. The browser interprets this as it usually would, that a new selected item will be the only selected one and any previous selected item will be rerendered as unselected. All I had to do to fix this was to move the attr bind parameter to come before the foreach param.

#### Issues with optionsValue and the value parameter becoming the string value