---
layout: post
title:  "Global Authorization attribute filter in MVC6 vnext, asp.net5"
date:   2015-07-27 13:30:00
tags: [development,web,configuration,mvc6,vnext,aspnet5]
---

Or "Where did RegisterGlobalFilters go".

You might have read [Securing your ASP.NET MVC 4 App and the new AllowAnonymous Attribute](http://blogs.msdn.com/b/rickandy/archive/2012/03/23/securing-your-asp-net-mvc-4-app-and-the-new-allowanonymous-attribute.aspx) or similar posts about adding a global `[Authorize]` attribute to your MVC project and then whitelist specific routes such as login pages. The code for this would look like this:

{% highlight c# %}
public static void RegisterGlobalFilters(GlobalFilterCollection filters)
{
    filters.Add(new HandleErrorAttribute());
    filters.Add(new System.Web.Mvc.AuthorizeAttribute());
}
{% endhighlight %}

And a whitelisted action would be decorated like this:

{% highlight c# %}
[AllowAnonymous]
public ActionResult Login(string returnUrl)
{% endhighlight %}

This is something that you should still do if your application is more private than public, it's just handled a bit differently in MVC6. You might have already figured that out by the `System.Web.Mvc.AuthorizeAttribute` line, since we don't want to use `System.Web` anymore.

In MVC6 you would instead use a [AuthorizationPolicy](https://msdn.microsoft.com/en-us/library/ms751416(v=vs.110).aspx) and apply it globaly. This is something that should be configured in your `startup.cs`'s `ConfigureServices` method, it would look something like this, depending on your specific needs.

{% highlight c# %}
public IServiceProvider ConfigureServices(IServiceCollection services)
{
	services.AddMvc();

    var policy = new AuthorizationPolicyBuilder()
		//This is what makes it function like the basic [Authorize] attribute
        .RequireAuthenticatedUser()
		//add functionality similar to [Authorize(Roles="myrole")]
        .RequireRole("myrole")
		//add functionality similar to [ClaimsAuthorize("myclaim")]
		.RequireClaim("myclaim")
        .Build();
	
	services.Configure<MvcOptions>(options =>
	{
        options.Filters.Add(new AuthorizeFilter(userPolicy));
	});
}
{% endhighlight %}

You could then use the `[AllowAnonymous]` attribute on your actions/controllers as in mvc5.