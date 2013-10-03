---
layout: post
title:  "Transactional repository pattern"
date:   2013-10-03 21:09:00
tags: [sql,code,architecture,pattern,back-end,n-tier,3-tier,stratiteq]
---

### Why a new pattern?
I should probably begin by saying that I have no idea if there is any prior art for this, this is something that I just came up with while building the back-end for a new application. It is meant to simplify making a sequence of repository calls from your busines logic while still having it transactional. It is yet to be fully battle tested but initial tests looks like it's working.

[Give me the code!](https://github.com/srosengren/transactionalrepositorypattern)

### How does it work?
The custom applications that we normally build at work are normal three layered applications with repository (Database), service (Business logic) and view layers, where the view layer is often built using the MVC pattern. The transactional repository pattern however is only concerned with the lower two layers of the application. When building CRUD apps it's quite easy to build the service/repository layers almost identical, meaning that every method on the service has a method on the repository that it calls and handles the data from it. This is fine if you're only doing CRUD and nothing else, but you will end up with lots of redundant repository code if you keep doing this when handling more complex scenarios on the service. What you would do here is probably to call several functions of the repository in a sequence from the service. You might get an uneasy feeling here about not handling your database commands on a transaction and are instead building business logic to handle failed DB calls. This is exactly what this pattern is meant to handle.

Here is my proposal for what a base repository class might look like when using a sql database:
We have a lazyloaded SqlConnection to our database and a lazyloaded SqlTransaction on this connection

{% highlight c# %}
private SqlConnection _con;
private SqlTransaction _trans;
protected SqlConnection Con
{
    get
    {
        if (_con == null)
        {
            _con = new SqlConnection(ConfigurationManager.ConnectionStrings["DB"].ConnectionString);
            _con.Open();
        }
        return _con;
    }
}
protected SqlTransaction Trans
{
    get
    {
        if (_trans == null)
            _trans = Con.BeginTransaction();
        return _trans;
    }
}
{% endhighlight %}

The reason for this is to simplify making several transactional calls in sequence on the same repository isntance.

We also have the major method, the ExecuteInTransaction method that we will later send actions to and have all repository calls in that action performed on a transaction.

{% highlight c# %}
public void ExecuteInTransaction(Action a)
{
  try
  {
    a.Invoke();
    Trans.Commit();
    Trans.Dispose();
    _trans = null;
  }
  catch
  {
    Trans.Rollback();
    Trans.Dispose();
    _trans = null;
    throw;
  }
}
{% endhighlight %}

What we see here is the invokation of a action, the transaction is commited if the action invokes without any exceptions, but rollbacked if it doesn't.

We would call the method from our service like this:

{% highlight c# %}
using (var repo = new PersonRepository())
{
  repo.ExecuteInTransaction(() =>
  {
    foreach (var person in persons)
    {
      repo.Add(person);
    }
  });
}
{% endhighlight %}

The PersonRepository in this example is a subclass of the TransactionalRepository that exposes the Add(Person) method. We then send an action to the ExecuteInTransaction method where we iterate over a list of persons, none of these will be commited to the database if any of them fails. This is of course just an example and you would probably use it with any number of methods in sequence on the repository (update,delete,get,etc). We can also make any number of ``ExecuteInTransaction`` calls on the same Repository instance (remember the lazy loaded connection and transaction) since we dispose of the transaction after each call.
You might have noticed that we're using a using statement in this example, the reason for this is of course to clean up after us when we're done, here's the ``Dispose`` implementation for the TransactionalRepository:

{% highlight c# %}
public void Dispose()
{
  if (_trans != null)
    _trans.Dispose();
  if (_con != null)
  {
    _con.Close();
    _con.Dispose();
  }

  GC.SuppressFinalize(this);
}
{% endhighlight %}

All we're doing here is releasing the resources that we have.

So that's the pattern, all that's left is trying it out!

[Full example code](https://github.com/srosengren/transactionalrepositorypattern)