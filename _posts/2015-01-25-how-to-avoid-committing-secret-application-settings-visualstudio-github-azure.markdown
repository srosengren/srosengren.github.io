---
layout: post
title:  "How to avoid committing secret application settings when working with visual studio, github and azure"
date:   2015-01-25 13:48:00
tags: [development,web,configuration,visualstudio,github,azure]
---

Committing appplication settings such as OAuth secrets and other credentials to your version control system of choice is a bad thing, especially if you're working on a open source project where everyone can see your code.

One might think that we could solve this by using the Web.Deb.config, or any other configuration specific override. But the problem with this is that it won't be loaded when we debug our application locally (pressing F5 etc). This means that we have to somehow keep our secret configurations "inside" the Web.config but make sure it doesn't get committed.

The strategy of being careful when merging Web.config or to edit it everytime before committing might work, but it only takes a single slip up and your settings are out there for everyone to see. And then you have to go around revoking applications, generating new application secrets and changing credentials.

A better strategy is to make sure that it can't be committed in the first place.

Looking at [https://msdn.microsoft.com/en-us/library/aa903313(v=vs.71).aspx](https://msdn.microsoft.com/en-us/library/aa903313(v=vs.71).aspx) we can see that there's a "file" attribute for the appSettings node. This attribute can contain a relative file path to an external settings file that only contains a appSettings node. When run, the keys in this file will be merged with the keys in the Web.config appSettings node. This means that you could keep shared settings in Web.config and private settings in the external file.

This is the strategy that I use.

I create a new file name Web.Secret.Config and make sure that it has its Build Action set to "none", otherwise Azure won't be able to build the project.
![appSettings file](/media/Web.Secret.config-properties.PNG)

![Web.Secret.config content](/media/Web.Secret.config-content.PNG)

I then modify my .gitignore to make sure that it doesn't get committed.
![gitignore](/media/gitignore-Web.Secret.config.PNG)

I modify Web.config, telling it to read this file if it exists.
![Web.config changes](/media/Web.config-Web.Secret.config.PNG)

This configuration is enough for us to run the project locally. Others can still run this code on their machines if you share it with them, even if you don't supply a Web.Secret.config file. It will still build and run just fine until they hit code that requires the setting, then the application will complain about the missing setting (note, not the missing file, the missing setting).

This is also what will happen if you deploy this code to azure. But Azure provides us with a great way to edit application settings through its interface. It's found in your website in Azure, below the configure tab.
![Azure settings](/media/Azure-AppSettings.PNG)

You now have a setup that allows you to hide settings from your version control system without you having to jump through hoops everytime you want to commit code. You're also not setting any unnecessary obstacles for anyone wanting to use your code, as they will get a self explanatory error when the application tries to use the missing setting.