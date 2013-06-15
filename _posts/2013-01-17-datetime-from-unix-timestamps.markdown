---
layout: post
title:  "datetime from unix timestamps"
date:   2013-01-17 09:06:00
tags: [development,unix,DateTime,C#]
---

C# Ticks are not the same as Unix Timestamps.

Ticks are instead 1/10.000 of a millisecond. This means that we of course cannot just do

{% highlight c# %}
new DateTime(long ticks); //with the TimeStamp as ticks
{% endhighlight %}

Instead we have to do it like this.

{% highlight c# %}
new DateTime(1970,1,1,0,0,0,0).AddSeconds(double ourTimeStamp)
{% endhighlight %}

Which is actually kind of pretty.

The reason for this is of course that a unix timestamps is expressed in seconds since 01-01-1970.