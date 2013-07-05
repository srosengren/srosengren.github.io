---
layout: post
title:  "Fiddler doesn't show WebClient request inside of MVC action on IIS"
date:   2013-06-29 01:06:00
tags: [web, .NET, C#, IIS, Fiddler, MVC, gotchas]
---

I pretty much always run my .NET applications on a local IIS server instead of using Visual Studios built in server, I also use the local IIS for debugging. The reasons for doing this is part performance, part not racking up VS debug server instances and part wanting to run the application from my devices over the network.

This created some grayhairedness today as I was implementing a client for a single sign on service. The requirements was to post some keys to a remote server and then redirect by using the response. The flow of the application made it necessary to perform this inside of a normal MVC action. Of course my first request to the server didn't work and debugging simply told me the response code and nothing more, fire up fiddler and view the request/response right? Well I could see the request to my action but nothing to the external service. Some googling told me that did could be because I was using localhost as my host and fiddler might not like this, so I used my machine name instead, still no luck. Lucky for me I have competent coworkers and one of them told me that this was probably due to me using the local IIS server and not Visual studios debugging server. Long story short, i fired up a debug server and there it was, my request showed up in fiddler.


Cliffs:
-  I always use a local IIS
-  WebClient request in MVC Action.
-  Request doesn't show in fiddler.
-  Tried running on Visual Studio debug server and it worked.