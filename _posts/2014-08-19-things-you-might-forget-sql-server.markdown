---
layout: post
title:  "Things you might forget how to do in sql (server)"
date:   2014-08-19 14:20:00
tags: [sql, sql server,stratiteq]
---

My goal has always been to be a "full stack developer" and this is also something that is required of me in my current position. But there used to be a time when a spent most of my energy on the top layers of application, ie UX, APIs and business logic, and less time with SQL. The aim of this post is to document some of the things in SQL Server that I've had to learn more than once due to using it to seldom, it should hopefully be stuck in my head by now though. Remembering things I've have forgotten isn't the easiest task, meaning that I'll be updating this post when I remember something new.

##Insert row into table with only a IDENTITY column
There might come a time when you have to do exactly this, it might not happen often, and you may have forgotten how to do it the next time you have to.

You might have a table that look like this
{% highlight sql %}
CREATE TABLE [dbo].[Counter]
  (
    Id INT IDENTITY(1,1) NOT NULL
  )
{% endhighlight %}

You can run this to insert a new row into it
{% highlight sql %}
INSERT INTO Counter DEFAULT VALUES
{% endhighlight %}

##Incrementing identity column in a transaction won't reseed on rollback
This is probably nothing that will ever come up while writing actual code. But I found it while experimenting with something.

Lets say that you have the following table
{% highlight sql %}
CREATE TABLE [dbo].[Person]
  (
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(255) NOT NULL
  )
{% endhighlight %}

And you run the following
{% highlight sql %}
BEGIN TRANSACTION
	INSERT INTO Person(Name)
	VALUES('Sebastian')
ROLLBACK TRANSACTION
{% endhighlight %}

Then you might expect that the Id column will reseed back to 1 when the rollback is executed, but that isn't the case. The identity won't rollback until you call either reseed or truncate
{% highlight sql %}
DBCC CHECKIDENT ('Person.Id', RESEED, 0); --The next inserted rows Id column will have the value of 1
--or
TRUNCATE TABLE Person --Will delete all rows in the table without logging, and reseed it
{% endhighlight %}