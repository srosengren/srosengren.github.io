---
layout: post
title:  "Relationship of jQuery data and data- html attributes"
date:   2013-11-03 21:26:00
tags: [web,javascript,jquery,frontend,stratiteq]
---

I have noticed a pretty common confusion about what the [jquery data](http://api.jquery.com/data/) function and HTML data- attributes are meant to do amongst developers that are new to building frontend bits. This can also be confusing for developers that got into jQuery before 1.4.3 (like me) as the data function was extended in this version.

The jQuery data function is a low level jQuery method that is also exposed to us developers, it's meant to store arbitrary data for a DOM element. This data is stored inside jQuery and is not visible on the element itself. The confusion seems to be related to how the get/set of data differs, using the function to get data will include values from data- HTML attributes on the element, but performing a set operation will not write to a data- attribute, even if an attribute with the same name exists. This means that if you use your server code to create a html element that has the attribute ``data-name="sebastian"`` and retrieive it using ``$(selector).data('name');`` you will get ``"sebastian"`` which is expected, but if you use it to first set its value with ``$(selector).data('name','rosengren');`` and then retrieve it as before, then you will of course get "rosengren" but inspecting the DOM will tell you that the value is "sebastian" and this will cause trouble if you use the data- attribute in other ways, perhaps in a css selector, jQuery selector or with the ``$.attr('data-name');``.

My rule of thumb is to keep updating the elements attribute if it's set from the start, but to use the data function to save more complex data for an element. The important thing is as always, make sure that everyone on your team does it the same way to avoid any unnecessary confusion.