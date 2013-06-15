---
layout: post
title:  "Change the framework for an application on IIS6"
date:   2012-08-30 13:38:00
tags: [web,iis,sitecore,development]
---

Sometimes you have to work with older software, like IIS6 on windows server 2003.

And sometimes this happen to coincide with you working on an application that requires an older framework, like Sitecore 6.1 on .NET2.0

I was trying to run a Sitecore 6.1 site in IIS6 on a windows server 2003 that had .NET 1.1 2.0 and 4.0 installed. The application was automatically started with .NET 4.0 which doesn't play well with Sitecore 6.1. I then tried to change the framework to .NET 2.0 which produced the following error.

>Changing the Framework version requires a restart of the W3SVC service. Alternatively, you can change the Framework version without restarting the W3SVC service by running: aspnet_regiis.exe -norestart -s IIS-Viirtual-Path

Well, I couldn't let it restart w3svc since a lot of other sites ran on the same server, so I tried the alternative with a few issues.

The first thing I noticed was that aspnet_regiis was not in my PATH so i had to find it on the filesystem (C:\WINDOWS\microsoft.net\Framework64\v2.0.50727\aspnet_regiis.exe for the 64bit version of 2.0).

The next issue was to find the virtualpath for my application. I found that there's a formula to this the path should look like this: "w3svc/appID", you can find your appID by locating your websites identifier field in the website view of the IIS manager.

This was of course not enough to get the application to run. I still had to create a new application pool and change the application to use this pool instead since there can only be one version of the .NET framework per pool. You can change the application pool by opening the properties for your application and looking under the "Home Directory" tab.