---
layout: post
title:  "Structuring less for multi-site projects"
date:   2013-09-11 18:22:00
tags: [web,frontend,less,css,code]
---


We sometimes find ourselves in the position that we have a single project that exposes several sites, most commonly a large brand with several smaller brands in the same corporation. This is yet another way in which LESS shines in comparission to writing plain old CSS. What we can do here is modify the pattern of having a "main" or "master" less file that includes other LESS "modules", the easiest thing to do here is to have several "main/master" files, one for each brand. These in turn will look the same but include different brand specific LESS files, among other LESS files that they share between them. For instance a brand(a)(b)(c)colors.less that each define the `@color-primary` variable, with different colors.

Here's an example folder structure that you might use for this, you could of course put all of the files in the same directory but it could get confusing quite fast.

{% highlight bash %}

.
|-- BrandA/
|   |── branda.less
|   |── brandacontent.less
|   └── brandavariables.less
|-- BrandB/
|   |── brandb.less
|   |── brandbcontent.less
|   └── brandbvariables.less
|-- variables.less
|-- mixins.less
|-- grid.less
└── content.less

{% endhighlight %}

*    variables.less is where we put our regular variables, perhaps some settings for a grid system.
*    mixins.less contains functions that are used in the rest of our less files.
*    grid.less is a module LESS file that creates the CSS for our grid system.
*    content.less might contain a few CSS modules that are shared between the sites.
*    brandXcontent.less contains CSS modules that are specific for a site.
*    brandXvariables.less contains variables that are specific for a site.
*    brandX.less simply imports the needed LESS files.

Most of these are self explaining but one thing to take note of is the ability to have variables with the same name in the brandavariables.less files. This is were we would put our `@color-primary` variable.

This is what the branda.less would look like:

{% highlight css %}

@import "../variables.less";
@import "brandavariables.less";
@import "../mixins.less";
@import "../grid.less";
@import "../content.less";
@import "brandacontent.less";

{% endhighlight %}

The important thing to note here is the precedence since LESS is parsed top to bottom and it parses @import's when it finds them. This precedence allows us to create modules inside of content.less that uses `@color-primary`, this module would then have different color schemes depending on which site you viewed, all with very minimal code duplication.