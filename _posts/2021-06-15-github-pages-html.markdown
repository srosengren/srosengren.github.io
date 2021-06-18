---
layout: post
title:  "Easy github pages index.html"
date:   2021-06-15 12:08:00
tags: [development,github,website]
---

## Preamble
This came about when I asked myself the question "What would be the easiest/quickest way for me to get a company webpage up in order to satisfy Apple's requirement for registering as a developer". I already have this blog hosted on Github pages ([Source code](https://github.com/srosengren/srosengren.github.io)), and although this setup is a bit convoluted (old installation of Jekyll, css build etc), I still liked the idea of hosting the page as a simple repository, and thought that there had to be a way of doing that with a simple `index.html` file (there is).

## Requirements
- A repository containing the source.
- A simple `index.html` file that contains everything that's needed for the page (which is only html and css right now).
- Custom domain name (Apple would not be satisifed with a domain name that isn't related to the company).
- HTTPS.
- Have [https://www.broccoliventures.com](https://www.broccoliventures.com) redirect to [https://broccoliventures.com](https://broccoliventures.com), which would be the main domain.

Turns out that Github pages supports "all" this, but some of it wasn't obvious.

## Confusion
- [This official looking guide](https://guides.github.com/features/pages/#:~:text=%20Getting%20Started%20with%20GitHub%20Pages%20%201,your%20project%20doesn%E2%80%99t%20mean%20you%20should...%20More%20) makes it look like you may only have a single Github page on your Github account (username.github.io), I remember this was a limitation way back when Github pages were new. [https://pages.github.com/](https://pages.github.com/) makes it quite clear however that it's possible to create unlimited "project" sites (remember to switch the toggle to "Project site").
- A lot of guides use `index.md` as an example to add content, and then they show you how to select a prebuilt theme etc. But it's perfectly fine to add a `index.html` that contains all the html, javascript, and css for your page. You would place the `index.html` in your [publishing root](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## What I did (in order)
1. [Follow the initial (Creating a GitHub Pages site) guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
1. [Configuring a publishing source for your GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
1. [Configuring an apex domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain) (as I want [https://broccoliventures.com](https://broccoliventures.com) without www. to be the domain name). (I used an `A` record for each of the listed Github IP addresses). [Here's the CNAME file for the site](https://github.com/srosengren/broccoliventures.com/blob/main/CNAME).
1. [Configuring an apex domain and the www subdomain variant](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain-and-the-www-subdomain-variant) as I do want redirects from [https://www.broccoliventures.com](https://www.broccoliventures.com) to [https://broccoliventures.com](https://broccoliventures.com).
1. [Securing your GitHub Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

## The code
[Here it is](https://github.com/srosengren/broccoliventures.com), at the time of writing the only code is a single `index.html` and a `CNAME` file.