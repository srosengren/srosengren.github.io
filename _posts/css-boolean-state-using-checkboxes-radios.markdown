---
layout: post
title:  "CSS boolean states using hidden checkboxes and radios"
date:   2014-07-27 18:41:00
tags: [web,css]
---

I recently came across [CSSSlider](http://cssslider.com/), a tool for creating pure css sliders/carousels, no javascript required at all. I really didn't get how they had done it at first, since I'd never thought of the approach that they took.

I took a look at the source code and saw a lot of labels and input type=radio. They were using the `:checked` psuedo selector to save boolean values and build visual states and animations based on these values. Pretty cool stuff if you ask me since i've never thought about using the `:checked` for anything more than displaying help/states in normal forms.

###So how does it all work?
I have simplified their css down to the bare essentials since they have lots of cool animations, play/resume and prev/next buttons. My example only show a simple slider with 3 items that can toggle which item to show

{% highlight html %}
<div class="container">
    <input id="showitem1" type="radio" name="slide" checked />
    <input id="showitem2" type="radio" name="slide" />
    <input id="showitem3" type="radio" name="slide" />
    <div class="slide slide1"></div>
    <div class="slide slide2"></div>
    <div class="slide slide3"></div>
    <label for="showitem1"></label>
    <label for="showitem2"></label>
    <label for="showitem3"></label>
</div>
{% endhighlight %}

I have three radios that are grouped together as the first items in the slide container, it's important that these come first which I will explain after I've shown the CSS. The order of your slides and the labels are only dependant on your layout, the functionality is there as long as they both come after the inputs. The labels connected to the inputs are important since it is they who will do the actual toggling when they are pressed, you'll need to add more of these if you want other cool stuff like prev/next buttons etc.

{% highlight css %}
input[type="radio"] {
    display:none;
}

#showitem1:checked ~ .slide1 {
    background: #1BA1E2;
}
#showitem2:checked ~ .slide2 {
    background: #E51400;
}
#showitem3:checked ~ .slide3 {
    background:#AA00FF;
}
{% endhighlight %}

I've removed the styling for the container/labels but they can be found in this [jsfiddle](http://jsfiddle.net/srosengren/Y8PMF/).

I `display:none` the inputs since we don't need their visuals, their associated labels will do the actual toggling. What actually makes this works is the `:checked` selector in combination with the adjacent sibling selector. Take the first line `#showitem1:checked ~ .slide1` as an example, this selector is only valid when the element `.slide1` comes after its sibling `#showitem1` and `#showitem1` is checked. This is also why the inputs must come before the slides, we can nest the slides how deep inside other parents we want. The only thing we need to make sure is that the inputs are on the same level and/or before one of the parents. There is unfortunately no css selector that can do any form of "select parent" or "select preceding sibling", so this is the best we've got.

###Cool stuff, what can I use it for?
Well, besides sliders I might try to build some menu systems based on this approach, maybe some kind of megamenu that should stay open on both `:hover` and clicks. I'd also like to try and make a drawer menu with it. Any form of self contained component could be fun to try with it. And after all, isn't stuff like a tab component just a slider?

###Any limitations?
[https://developer.mozilla.org/en-US/docs/Web/CSS/:checked](https://developer.mozilla.org/en-US/docs/Web/CSS/:checked) Availability looks pretty good, only IE8 missing.

Working fiddle can be found [here](http://jsfiddle.net/srosengren/Y8PMF/).