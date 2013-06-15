---
layout: post
title:  "Download file / image instead of displaying it in browser"
date:   2012-09-24 13:53:00
tags: [web,image,file,MVC,HTTP,development]
---

New day new requirements. Atleast this was an easy one.

The normal action when clicking an anchor tag with an href pointing to an image is to display the image in the browser. Today this was not the desired outcome, instead I wanted to put an "Download image" button next to the image. The solution to this is very simple if you have access to the http server response. This was no problem for me since I'm working with asp.NET MVC, all I had to to was to add an extra header to the response. The content-disposition header to be precise.

This header has two parts that were important to me, the disposition-type and the filename parts. The default disposition-type is inline and this is what tells the browser to show content that it knows how to display, the type that I wanted was attachment that tells the browser to treat the image as a downloadable file. The filename part is only useful when using the attachment type. Simply include filename=my-filename in the header.

This is the result (MVC example):

{% highlight c# %}
Response.AppendHeader("content-disposition", "attachment;filename=" + myfile.Name);
{% endhighlight %}

And this is really all there is to it.