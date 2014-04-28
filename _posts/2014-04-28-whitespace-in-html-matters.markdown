---
layout: post
title:  "Whitespace in HTML matters"
date:   2014-04-28 14:17:00
tags: [html,css]
---

Inline elements in html are elements that flow in the documents direction (ltr/rtl) until they hit the edge, and then they line break, just as text in a book or a newspaper. When rendering such elements (spans or display: inline,inline-block etc) the browser will treat the whitespace between them as having a width of 0.25em of the parent elements font-size, assuming that they aren't floated or taken out of the normal flow in any other way. Elements without any whitespace between them will be treated as a single continuous element (but keeping their individual applied styling), until hitting  the edge of the parent.

This gives us two effects/issues depending on how we see it.

#### Text-align justify on parent
There's not much to say about this, but it's something that can really bite you in the ass, as it did with me. Text-align:justify will try to space out inline elements to hit both edges of the documents at the same time (except for the last line), similar to some magazine layouts. The issue here is that inline elements without any whitespace will simply not be justified since they are considered a continuous element. This is easy to forget if you're for instance concatenating html in javascript. The solution here is to always include whitespace in your markup, which you mostly likely will if you're using an editor with formatting. You should include either a space or '\r\n' after each element if you're appending elements to the DOM through javascript.

BONUS: text-align:justify on a single line
{% highlight css %}
.justified {
    text-align: justify;
}

.justified:after {
    content: "";
    display: inline-block;
    width: 100%;
}
{% endhighlight %}
What we do here is to add a pseudo element to the parent with justify on it and use that element to create a new line (width: 100%) this makes sure that every "real" line is justified since only the last line is ignored.


#### Width on inline-block elements
You might have seen some fluid grid system or similar that uses display: inline-block on their spans/columns to avoid row collapse due to floating spans/columns in "regular" grid systems. The beauty of inline-block is its ability to flow like a inline element while having block like properties such as margins and the ability to adjust its dimensions.

The issue here are those 0.25em that I wrote about in the first paragraph. You might for instance have your body font-size set to 16px and want to add a 4 column row where each column takes up 25% of the width.

You might write your CSS along these lines
{% highlight css %}
body {
    font-size: 16px;    
}

.col {
    display: inline-block;
    width: 25%;
}
{% endhighlight %}

And then you create your HTML and you or your editor format it like this.
{% highlight html %}
<div class="row">
    <div class="col"></div>
    <div class="col"></div>
    <div class="col"></div>
    <div class="col"></div>
</div>
{% endhighlight %}

Then you get a headache since the last col is on a new row. This happens since the full width of your 4 columns is 25% * 4 plus 0.25 * 16p * 3. Or 100% + 12px, there are 12px extra since the browser only calculates the whitespace between your 4 columns.

You could solve this be writing your markup like this:
{% highlight html %}
<div class="row"><div class="col">col</div><div class="col">col</div><div class="col">col</div><div class="col">col</div></div>
{% endhighlight %}

But this will become hard to maintain since auto formatting might break it or another developer might not know why it's formatted like this and add content of his own that is formatted in another way.

The CSS way of solving this comes from the fact that the whitespace width is calcualted from the parents font-size, so we solve it by setting the font-size of the row to zero and add a font-size property to the col.

{% highlight css %}
body {
    font-size: 16px;    
}

.row {
    font-size: 0;
}

.col {
    display: inline-block;
    width: 25%;
    font-size: 16px;
}
{% endhighlight %}

This does have its own drawback, mainly that we lose the ability to use em for fontsizes since we reset it at each nested row. This could be solved by adding sizing classes that decides the fontsize of a specific row.