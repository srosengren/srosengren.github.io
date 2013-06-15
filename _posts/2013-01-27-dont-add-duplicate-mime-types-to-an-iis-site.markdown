---
layout: post
title:  "Dont add duplicate mime-types to an iis site"
date:   2013-01-27 20:02:13
tags: [development,web,iis]
---

It is for some reason possible to add duplicate mime-types through inheritance to a site running on IIS. Doing this will cause 500 server error for statically served files.

My issue was with running virtual directory sites and adding a mime-type to the default site itself. The solution was to remove it from the top level and only adding it on the virtual sites that really needed it.