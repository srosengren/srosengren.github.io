---
layout: post
title:  "Things you might forget how to do in sql (server)"
date:   2014-08-19 14:20:00
tags: [sql, sql server,stratiteq]
---

My goal has always been to be a "full stack developer" and this is also something that is required of me in my current position. But there used to be a time when a spent most of my energy on the top layers of application, ie UX, APIs and business logic, and less time with SQL. The aim of this post is to document some of the things in SQL Server that I've had to learn more than once due to using it to seldom, it should hopefully be stuck in my head by now though. Remembering things I've have forgotten isn't the easiest task, meaning that I'll be updating this post when I remember something new.

##Delete from table based on join
Sometimes you want to delete rows in a table but you have to constrain what rows to delete based on another table. Lets say that you have a database for a online shop and you want to remove all items from any manufacturer that you are no longer in business with.

The DB might look like this:
{% highlight sql %}
CREATE Table Item (
	ItemId INT,
	ManufacturerId INT
)
Create Table Manufacturer (
	ManufacturerId INT
)
{% endhighlight %}

You could then write the query like this:
{% highlight sql %}
DELETE i
FROM Item i
INNER JOIN Manufacturer m ON m.ManufacturerId = i.ManufacturerId
{% endhighlight %}

And this would only delete the items connected to this manufacturer.

##Fieldnames in select is accessible from subquery
This is generally a good thing, being able to use a fieldname from your select statement in a subquery. You could for instance write a select like this:

{% highlight sql %}
CREATE Table #Car (
OwnerId INT,
PlateNumber NVARCHAR(16))

--Fill #Car

SELECT p.PersonId,p.Name
FROM Person p
WHERE p.PersonId IN (SELECT OwnerId FROM #Car)
{% endhighlight %}

And you would get every person that owns a car.

But this can also bite you in the ass if you're not carefull, or as in my case, assume too much about your fieldnames. We write the same query again but change the subquery since we assume that the OwnerId field is called PersonId in this table to.

{% highlight sql %}
CREATE Table #Car (
OwnerId INT,
PlateNumber NVARCHAR(16))

--Fill #Car

SELECT p.PersonId,p.Name
FROM Person p
WHERE p.PersonId IN (SELECT PersonId FROM #Car)
{% endhighlight %}

We will now get every row in the Person table since we're actually comparing Person.PersonId with itself. Not something that should happen too often, but it might if you have a lot of tables that follow a naming convention, and then one table where the fieldname differs.

##Get a list of previously run queries.
I thought I had lost half a days of work in the most stupid way. I had built a query that I was going to make into a stored procedure, I copied the code from SSMS into a new stored procedure created in Visual studio and saved it to disk, without publishing the DB project to a database. I then closed the query window in SSMS since I was done, I then somehow wrote over the stored procedure file from another query window in SSMS with code that was meant for another sproc, and I thought that was it. Luckily one of my coworkers showed me how to get the last executed queries from a database.
{% highlight sql %}
SELECT deqs.last_execution_time AS [Time], dest.text AS [Query], dest.*
FROM sys.dm_exec_query_stats AS deqs
CROSS APPLY sys.dm_exec_sql_text(deqs.sql_handle) AS dest
WHERE dest.dbid = DB_ID('DBNAME')
ORDER BY deqs.last_execution_time DESC
{% endhighlight %}
Just replace DBNAME with the name of the database you want to retrieve queries from, and then run it. This also shows that you should be honest about making mistakes, if I had decided to recreate the query without telling anyone then it might have cost me an hour, and might have been a sloppy recreation with hidden bugs, instead it took 5 minutes and I learned something new!

##Insert row into table with only a IDENTITY column
There might come a time when you have to do exactly this, it might not happen often, and you may have forgotten how to do it the next time you have to.

You might have a table that look like this
{% highlight sql %}
CREATE TABLE [dbo].[Counter]
  (
    Id INT IDENTITY(1,1) NOT NULL
  )
{% endhighlight %}

And you might think, "How do I insert into this?" since you can't do it like this
{% highlight sql %}
INSERT INTO Counter(Id) VALUES(??)
{% endhighlight %}
But what you can do is this. This will insert a new row and increment the Id.
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