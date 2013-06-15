---
layout: post
title:  "dont check for case sensitive request headers in your serverside code"
date:   2013-02-22 14:32:00
tags: [development,asp.net,MVC,web,gotchas]
---

Todays funny bug, no ajax request would return data in a real IE8 (not effecting ie10 in ie8 mode).

We're building a MVC4 + WebApi app and are heavy users of ajax that we setup using $.ajaxSetup and setting custom AuthToken and AuthTokenSalt headers in the beforeSend function.

Everything works perfectly fine in every other browser but IE8 kept complaining. Turns out that someone had implemented a simple first line check for testing if the required headers were present in the request, only thing was that the check looked something like this:

{% highlight c# %}
HttpContext.Current.Request.Headers.AllKeys.Contains("AuthToken") == null
{% endhighlight %}

Which of course does a case-sensitive compare, but IE8 had none of that since it sends custom headers in lowercase. The solution was to simply do a case-INsensitive request header check.

{% highlight c# %}
HttpContext.Current.Request.Headers["AuthToken"] == null
{% endhighlight %}

This seemed like a much simpler solution than changing the beforeSend to only send lowercase headers and then remembering that when adding new headers in the future.