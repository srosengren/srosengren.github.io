---
layout: post
title:  "Repurpose, rename ASP.NET solution and projects"
date:   2014-02-08 09:20:00
tags: [asp.net,stratiteq,tfs]
---

Exciting times as Stratiteq, I've gotten my first "new" application where I will be tech lead. It's an application built for a specific part of the customers service offerings, but it turns out that it would be perfect for other services that the customer offers. The teams job will be to adapt the application to allow for several services.

The "new" application has gotten a new name, but it will replace the old one in production with the old data migrated over. We've also created a new TFS node where the code, user stories, etc will reside. This is because the application started out as a complement to another one, but it has now been upgraded to "a real deal". Because of this it makes perfect sense to simply copy the coed of the old application into the new TFS node and rename everything. 

We use a "customer.application.project" namespace convention at Stratiteq, and in this instance we need to swap out the application part for the new name in the solution, projects and files and folders on disk. There are a few ways to do this, you can either try to do everything in visual studio, do everything by hacking files, or combine the two. It might be tempting to just do it in visual studio, but it soon stacks up with all the dialogs to rename project, rename assembly name, default namespace, product and assembly title. On the other end, you could probably write a nice script that finds .sln, .csproj, .cs files and folders with your namespaces and replace any isntance of the old name with the new one, but this wouldn't be the fastest way for me since I'm no good with powershell or anything similar.

This is what I did:
The only reason for doing this in any form of order is to keep the projects in visual studio so you can make a few time saving changes here, it doesn't really matter otherwise since nothing will work/build from the moment you start until you're finished.

### Replace usings
My first step was to replace any usings in .cs files by doing solution wide search and replace (ctrl + h with my settings), remember to select that it should apply to any file in the solution and click okay when it tells you that this might be a bad idea. I search for the customer.application part of the name space and replace it with customer.newapplication, this is to not screw up anything that happens to be named the same as you old application name but shouldn't be changed.

### Rename projects
I do this in visual studio since I found it faster than going into each folder and renaming each .csproj file manually. This will also change any references in the solution and in other project files to what we want, but it isn't really matter since we will do some other search and replace later.

This will unfortunately not rename the folders that the projects are in (if your application keeps projects in separate folders).

### Rename project folders
This has to be done manually and is only necessary if you keep your projcts in different folders.

### Hack the files
Now I opened the .sln and .csproj files in a text editor (I use sublime text) and did the same qualified search and replace as in the "Replace usings" step.

### Try to build
I've found that trying to build now can result in three outcomes.
-    It either works perfectly, in which case you can try and actually run it and see what happens. Visual studio should give you any information as to what might be wrong from here on out.
-    I had a few not fully qualified type references (application.project.type without the customer qualifier), I just had to go through the build errors and replace the application name here to.
-    You can get a asp.net temporary files error if you've change the name of the solution and built/run it before you started to rename anything else. This is because your types will be found in duplicate assemblys. You solve this by doing "clean" on your solution and checking in the bin folder of your main web project(s) and removing any .dll with the old name. You then remove the application folder with the same name as your application in the temporary asp.net files folder. Mine is found in C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Temporary ASP.NET Files since I run a 4.5 application on a 64 bit system. Navigate accordingly from the C:\Windows\Microsoft.NET\ folder if your machine/application differs from mine.

### Done?
You should now be able to build and run your application, I was atleast, but as we know, none of these step by step tutorials are 100% since there are millions of combinations that can differ from dev to dev/machine to machine/application to application when doing software development, but I hope that I've helped you atleast a bit.