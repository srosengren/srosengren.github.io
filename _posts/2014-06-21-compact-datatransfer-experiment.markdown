---
layout: post
title:  "Compact datatransfer experiment"
date:   2014-06-21 21:17:00
tags: [javascript,json,http,api,web,stratiteq]
---

I create a lot of different APIs in my work, several of them send out fairly large arrays of objects where the property names of these objects are the bulk of the data being transfered. This is mostly mitigated by compressing the data, but I figured, why not try and see if I can shrink it down a bit more. Most of the APIs are consumed on mobile devices and every second counts. This means that any byte we can save over the line has to be weighed against the cost of reconstructing the objects on the client.

Lets try it out!
I'm building this "on top" of JSON since this is a very well supported format with serializers written in any concievable language. The receiving client in this example is a web site and the parsing javascript code is no more than 11 lines long. The server is a ASP.NET web api that randomizes 5 thousand products and send out their nutritional values as integers that are at most 6 digits long.

My proposed format is to send the definition of an object as the first item of an array, with every actual item being sent as a subarray with the data in the same order as the properties in the definition.
Something like this:

{% highlight javascript %}
[[
'prop1',
'prop2'
],[
'item1value1',
'item1value2'
],[
'item2value1',
'item2value2'
]]
{% endhighlight %}

Normal JSON server code:

{% highlight c# %}
[HttpGet]
public HttpResponseMessage Get()
{
    var products = new List<Product>();
    var r = new Random();

    for (var i = 0; i < 5000; i++)
    {
        products.Add(new Product
        {
            Calories = r.Next(100000),
            Carbohydrates = r.Next(100000),
            Proteins = r.Next(100000),
            Fats = r.Next(100000),
            SaturatedFat = r.Next(100000),
            UnsaturatedFat = r.Next(100000)
        });
    }

    return Request.CreateResponse(products);
}
{% endhighlight %}

This is just a normal ASP.NET api where I create 5000 strongly typed objects and returns them as a list that is then serialized to JSON and sent to the client.

Compact JSON server code:

{% highlight c# %}
[HttpGet]
public HttpResponseMessage GetAjson()
{
    var products = new List<object[]>();
    var r = new Random();

    products.Add(new string[] { "Calories", "Carbohydrates", "Proteins", 
        "Fats", "SaturatedFat", "UnsaturatedFat" });

    for (var i = 0; i < 5000; i++)
    {
        products.Add(new object[]
        {
            r.Next(100000), r.Next(100000), r.Next(100000), 
            r.Next(100000), r.Next(100000), r.Next(100000)
        });
    }

    return Request.CreateResponse(products);
}
{% endhighlight %}

This code creates the same data but we send the object definition as the first item in the array, and every object as a subarray only containing the data.This means that we can only send objects with the same definition this way, but that covers 90% of my endpoints.
The code shown here is only a mock that creates the data for measure, a live example would user a nice serializer that could take any type of object.

Javascript deserializer:

{% highlight javascript %}
ajson = {
    deserialize: function (ajsonArray) {
        var definition = ajsonArray.splice(0,1)[0];
        for (var i = 0; i < ajsonArray.length; i++) {
            var o = {};
            for (var p = 0; p < definition.length; p++)
                o[definition[p]] = ajsonArray[i][p];
            ajsonArray[i] = o;
        }
    }
};
{% endhighlight %}

This code removes the definition from the received array and uses it to in place replace every subarray containing the objects data with real objects.

###So what does this work give us?

I use fiddler to look at the requests and some javascript time checking to see how long the deserialization takes. The results are as follows:
*	5000 items normal JSON, GZIPed ~118KB, no compression ~572KB
*	5000 items compact JSON array, GZIPed ~88KB, no compression ~187KB

I have tried a few different configurations and the saving is ~25% in most cases, this will not hold true if your objects contains lots of data as the property:data ratio will be different, but it produces significant savings in many of the APIs that I create.

The overhead of deserializing it on the client? The 5000 items took 7ms to deserialize from normal JSON to a a javascript array. The same items took 7ms + 25ms to deserialize from compact JSON to a javascript array. This is tested on chrome on my ultrabook, and I believe that it will take a while longer to run on, for instance IE8, but so will deserializing it from normal JSON too.

These tests show that serializing data like this can improve performance in applications that send out lots of items containing very small data.
