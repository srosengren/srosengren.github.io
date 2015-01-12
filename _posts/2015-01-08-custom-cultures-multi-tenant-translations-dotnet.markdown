---
layout: post
title:  "Custom cultures and multi-tenant localizations in .net"
date:   2015-01-08 16:15:00
tags: [localization,development,translations,resources,cultures,aspnet,web,stratiteq]
---

I'm currently converting a webapplication into a multi-tenant solution for a client at work. Handling translations in the app is currently done using resource (.resx) files to build a master resource collection. The client can then translate any resource into a specific language using a separate tool that creates satellite assemblies which are then dropped into the bin folder, just like visual studio does if you create a specific culture .resx file. The application then sets the culture based on the Accept-Language header when it receives a request (unless it's already been set). The user can override this inside the application.

![Resources in Visual Studio](/media/VSResources.PNG)
<p><small>Notice that the Main.sv.resx file doesn't have a designer file attached to it.</small></p>

![Satellite resource assembly on disk](/media/ResourcesLocation.PNG)
<p><small>This is where the "sv" translations will end up.</small></p>

One of the requirements for the project is to make sure that every tenant can override resources to their liking. This includes being able to create tenant specific resources for any language/culture such as en-US, en-IE, etc.

The simplest solution for this that I could come up with, that makes as little impact on existing tools as possible, is to create custom cultures by appending a tenant identifier to the end of the culture to override, ie en-tenantname or en-US-tenantname. The problem here is that we can't simply set the applications culture to any arbitrary name, even though we might have satellite assemblies that are compiled and contains resources for this culture.

We instead have to programmatically (or manually) install the custom culture. Something that might be a problem here is that the application has to be run as administrator for this code to run. This is something that wasn't acceptable in our environment (running a webapp as admin that is), and I instead opted to build a separate tool to install the cultures. This is something that works for me since the client isn't able to create any tenants without informing us first, and we have agreed on what languages they are using. But your mileage may vary.

Here's the code for installing a custom culture:
{% highlight c# %}
var cultureAndRegionInfoBuilder = new CultureAndRegionInfoBuilder(customCultureName, CultureAndRegionModifiers.None);
var parentCultureInfo = new CultureInfo(parentCultureName);
RegionInfo regionInfo = new RegionInfo(parentCultureInfo.Name);

cultureAndRegionInfoBuilder.LoadDataFromCultureInfo(parentCultureInfo);
cultureAndRegionInfoBuilder.LoadDataFromRegionInfo(parentCultureInfo);

cultureAndRegionInfoBuilder.CultureEnglishName = customCultureName;
cultureAndRegionInfoBuilder.CultureNativeName = customCultureName;

//This code makes sure that we fallback to the parent culture on a missing translations
//It will fallback to default culture if you remove this line
cultureAndRegionInfoBuilder.Parent = parentCultureInfo;

cultureAndRegionInfoBuilder.Register();
{% endhighlight %}

If you run this code to install a custom culture while having Visual Studio running, and creates a new .resx file for the culture, then you have to restart VS for it to recognize your custom culture and actually build an assembly and drop it in /bin/

This code uses the normal globalization assemblies, but it also requires sysglob.dll which is shipped with the .net framework since this includes the "CultureAndRegionInfoBuilder" type.

Here's the code for using the custom culture in the application
{% highlight c# %}
var cultureInfo = new CultureInfo(name);
if (!string.IsNullOrWhiteSpace(tenantName))
{
    name = name + "-" + tenantName;
    if (CultureInfo.GetCultures(CultureTypes.AllCultures).Any(ci => ci.Name.Equals(name)))
        cultureInfo = CultureInfo.GetCultureInfo(name);
}

Thread.CurrentThread.CurrentUICulture = cultureInfo;
Thread.CurrentThread.CurrentCulture = cultureInfo;
{% endhighlight %}

This code checks that we actually have an overriding culture installed for this tenant before it tries to use it, since it will throw an exception if you try to use a culture that doesn't exist. This code will also fallback gracefully since we might have installed the culture but haven't yet created any translations for it (this is built in behaviour).