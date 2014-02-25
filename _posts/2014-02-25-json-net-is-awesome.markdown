---
layout: post
title:  "Json.NET is awesome"
date:   2014-02-25 10:41:00
tags: [asp.net,json.net,json,javascript,mvc,webapi]
---

99% of the work that I do involve asp.net webapi and asp.net mvc in some way, I normally build applications using knockoutJS on the frontend and asp.net webapi as, well, a web api. Json.NET is the default javascript/json handling library in asp.net mvc and webapi. It normally perform its magic under the hood without us having to worry about it. For instance it's responsible for serializing your c# object to json when you do ``return Request.CreateResponse(object);`` in webapi and the request has the contentType header set to ``application/json``.

This is all well and good but sometimes we want to controll how it serializes objects.

## Properties in c# are normally PascalCase while they are camelCase in javascript

This could be solved by having c# dto classes that have camelCase properties, or javascript objects that have PascalCase properties. It can also be solved by having javascript constructors or a factory that takes json data with PascalCase properties and creates objects with camelCase properties with the same data.

But what if we want to use a mapper such as knockoutJSs ko.mapping that takes data and returns the same object but with observable proeprties, we could run a constructor/factory before this, or we could fork the mapping source and build our own. Or we could use the Json.NET ``JsonProperty`` attribute that can be applied to properties.

{% highlight c# %}
[JsonProperty(PropertyName = "ids")]
public List<int> Ids
{% endhighlight %}
<small>The JsonProperty lives in the Newtonsoft.Json namespace</small>

This is then parsed when serializing our object to javascript/json and sets the property name to the one specified in the attribute. I have unfortunately not found a way to apply camelCase property names to all properties in a class, but you could probably write a class level attribute to handle this, or write a property snippet in visual studio that outputs the attribute.

## I sometimes want the text value of my Enums to be serialized instead of the integer value
This can be accomplished by adding another attribute to the property.
{% highlight c# %}
[JsonConverter(typeof(StringEnumConverter))]
public UserType Type { get; set; }
{% endhighlight %}
<small>The JsonConverter lives in the Newtonsoft.Json namespace</small>

And yes, these can be stacked 

{% highlight c# %}
[JsonProperty(PropertyName = "type")]
[JsonConverter(typeof(StringEnumConverter))]
public UserType Type { get; set; }
{% endhighlight %}

## How about a list of enums as string?

{% highlight c# %}
[JsonProperty(PropertyName = "weekDays", ItemConverterType = typeof(StringEnumConverter))]
public List<Occurence> Weekdays
{% endhighlight %}

We are now down to only using the ``JsonProperty`` attribute again.