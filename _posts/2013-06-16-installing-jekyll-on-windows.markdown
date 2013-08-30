---
layout: post
title:  "Installing Jekyll on Windows"
date:   2013-06-16 15:16:00
tags: [development,web,python,ruby,jekyll]
---

-  Use Ror 1.9 for painless installation. http://railsinstaller.org/en
-  Python 2.7.5 for Pygments.
-  setx path "%path%;c:\Python27". Restart console
-  Don't forget to set HOME PATH if it's currently set to a network drive. SET HOME=%USERPROFILE%
-  gem install jekyll
-  gem install pygments.rb. Only use 0.5.0 as of writing http://stackoverflow.com/questions/17364028/jekyll-on-windows-pygments-not-working