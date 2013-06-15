---
layout: post
title:  "RedirectToAction and the ViewBag"
date:   2012-11-14 09:55:22
tags: [development,web,MVC]
---

This should have been fairly obvious, but we cannot expect the ViewBag to persist since a RedirectToAction only serves the client with a 302 redirected HTTP response to the new route. A solution for this is to use "TempData["key"]", this is a dictionary that is persisted in the users session meaning that we can retrieve it in the new action or controller or wherever the recieving end is.