---
layout: post
title:  "Removing zone div wrapper in Orchard"
date:   2012-08-31 20:51:00
tags: [web,orchard,development]
---

If you have ever tried building a new Orchard theme from scratch, and like me you like full control of your markup. Then perhaps you have noticed the extra "zone-name" div that Orchard adds around every zone.

This is great for creating a semantic markup, but it didn't suit my needs for a minimal markup and I wanted them gone.

It turns out that this is really easy to accomplish. There is a file in the Orchard.Core called CoreShapes.cs which, as you may have guessed, defines some of the basic shapes. For instance, the Zone shape looks like this:

{% highlight c# %}
        [Shape]
        public void Zone(dynamic Display, dynamic Shape, TextWriter Output) {
                    string id = Shape.Id;
                    IEnumerable<string> classes = Shape.Classes;
                    IDictionary<string, string> attributes = Shape.Attributes;
                    var zoneWrapper = GetTagBuilder("div", id, classes, attributes);
                    Output.Write(zoneWrapper.ToString(TagRenderMode.StartTag));
                    foreach (var item in ordered_hack(Shape)){
                                    Output.Write(Display(item));
                                    Output.Write(zoneWrapper.ToString(TagRenderMode.EndTag));
                                }
{% endhighlight %}

 As you can see this outputs a div tag around your items (content,widgets). The only thing that I really want keep here is the foreach loop. I could of course edit it right here but that wouldn't be very flexible of me now would it?


 Two of the great things about Orchard's shapes is that Orchard always picks the one with the highest precedence, and that it doesn't care if it's defined in code or markup. This means that we can override the Zone shape in our theme by simply adding a Zone.cshtml file in the Views folder of the theme. The markup of this file would look like this:

{% highlight c# %}
     @foreach (var item in @Model) {
             @Display(item)
         }
{% endhighlight %}

 Now this might look like code, but hey, it's razor!