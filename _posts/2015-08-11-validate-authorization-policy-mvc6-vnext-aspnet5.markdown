---
layout: post
title:  "Validate authorization policy in MVC6 vnext, asp.net5"
date:   2015-07-27 13:30:00
tags: [development,web,configuration,authorization,mvc6,vnext,aspnet5]
---

###Background
Asp.net vnext now supports creating authorization policies through code. What this means is that you no longer have to copy paste your role/claim names all over your application (Or build your own system around this). You can instead declare policies in a central place and authorize based on these, allowing for easier/safer refactoring. 

[Barry Dorrans](https://github.com/blowdart) cover how to create/register policies [here](https://github.com/aspnet/Announcements/issues/22)


###The "problem"
What's missing here is how to check if the current user passes authorization based on the policy in code. I does cover how to validate a policy with the ``[Authorize(Policy="MyPolicy")]`` attribute. But in my case I would like to toggle a link in the application based on the policy.

###The solution
So how would we write code to toggle this link then? Unfortunately there isn't something similar to ``IsInRole()`` on the ``User (ClaimsPrincipal)`` property, Which I guess makes sense.

After digging through some of the [https://github.com/aspnet/Security](https://github.com/aspnet/Security/) source code I found that I probably want to get a hold of an instance of ``IAuthorizationService``. While there isn't one readily available (as in a specific property) on our ``Context``, we can easily get it through ``Context.RequestServices``.

We have to make sure that we're using ``Microsoft.AspNet.Authorization`` and ``Microsoft.Framework.DependencyInjection`` in our code (the solution works in both our controller/actions, and .cshtml files).

Meaning that our .cshtml file could look something likes this:

{% highlight html %}
@using Microsoft.AspNet.Authorization
@using Microsoft.Framework.DependencyInjection

@if(await Context.RequestServices.GetRequiredService<IAuthorizationService>().AuthorizeAsync(User, null, "MyPolicy")){
  @Html.ActionLink("Blocked link","Our blocked action")
}

{% endhighlight %}