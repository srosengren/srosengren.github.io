---
layout: post
title:  "XSLT rendering with sc:image in for-each"
date:   2012-08-29 08:55:00
tags: [web,sitecore,xsl,development]
---

It was a real easy task. Display the ImageField and GeneralLinkField for every item that was selected in a MultiListField.

So I took a look at the code, crap, it's XSLT and I'm mostly a .NET guy who never touches the stuff. It wasn't easy to find a clear answer to this question, the closest I came was this blog by John West,[http://www.sitecore.net/Community/Technical-Blogs/John-West-Sitecore-Blog/Posts/2010/11/Select-and-Link-to-Media-Items-with-XSLT-Using-the-Sitecore-Web-Content-Management-System.aspx](http://www.sitecore.net/Community/Technical-Blogs/John-West-Sitecore-Blog/Posts/2010/11/Select-and-Link-to-Media-Items-with-XSLT-Using-the-Sitecore-Web-Content-Management-System.aspx)

It goes a bit deeper than I needed but the info was good for learning about working with XSLT in sitecore. I would've never thought of nesting for-each's to account for broken Sitecore links.

In the end, this is what it all came to.

{% highlight XSLT %}
 &#x9;&#x9;&amp;lt;xsl:variable name=&quot;socialHeader&quot; select=&quot;sc:item('/sitecore/content/site/Site settings/Social/HeaderSocialSettings',.)&quot; /&amp;gt;&#xD;&#xA;        &amp;lt;xsl:for-each select=&quot;sc:Split('SocialImageLinks',$socialHeader)&quot;&amp;gt;&#xD;&#xA;          &amp;lt;xsl:for-each select=&quot;sc:item(text(),.)&quot;&amp;gt;&#xD;&#xA;            &amp;lt;sc:link field=&quot;linkforimage&quot;&amp;gt;&#xD;&#xA;              &amp;lt;sc:image field=&quot;linkimage&quot; w=&quot;16&quot; h=&quot;16&quot; class=&quot;ImageSocial&quot; /&amp;gt;&#xD;&#xA;            &amp;lt;/sc:link&amp;gt;&#xD;&#xA;          &amp;lt;/xsl:for-each&amp;gt;&#xD;&#xA;        &amp;lt;/xsl:for-each&amp;gt;&#xD;&#xA; 
{% endhighlight %}

The first line takes the value of my MultiListField "SocialImageLinks" on the item contained in the xsl variable "$socialHeader", it then uses the SC extension "Split" to split it to separate IDs. The next line might seem odd since it's a for-each on what should only be a single item. But according to John this to prevent broken links since the for-each will simply step over empty values returned by the "item" extension. Text in this context is the current value returned by the split. I then simply use a sc:link control and tell it to use the GeneralLinkField "linkforimage" on the current item that was returned by the sc:item extension. The same goes for the sc:image control that uses the "linkimage" ImageField.

This outputs every image wrapped in an anchortag just the way I wanted it to.