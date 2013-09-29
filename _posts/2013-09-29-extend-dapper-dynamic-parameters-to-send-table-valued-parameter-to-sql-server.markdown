---
layout: post
title:  "Extend Dapper Dynamic Parameters to send Table Valued Parameter to SQL Server"
date:   2013-09-29 13:29:00
tags: [sql,sql server,dapper,dynamic parameters,code,stratiteq]
---

So you want to pass a list of something to a SQL stored procedure/Query using Dapper? And you want to receive it as a [Table Valued Parameter](http://technet.microsoft.com/en-us/library/bb510489.aspx)? Sounds great, you might feel a little bummed that this isn't supported out of the box in Dapper, meaning that you can't simply put a IEnumerable as a param in the dynamic param object that a Dapper query accepts. But fear not, it's pretty easy to do yourself, depending on how thorough you want to be.

I'm simply going to create a one-off solution that you can easily expand on yourself.

I will not pretend to be an expert on the inner workings of Dapper, but I do know that the ``Query<t>`` method takes a parameter called param that is of type [dynamic](http://msdn.microsoft.com/en-us/library/dd264736.aspx), meaning that we can put an inline object initilazier here, or an object of any type. The magic that we're after happens if we create a new type that implements Dappers ``IDynamicParameters`` interface.

But first things first, let us assume that you have a stored procedure that takes a TVP parameter of ids for filtering on. It might look like this:

{% highlight sql %}

-- CREATE THE TYPE TO USE AS A PARAMETER FOR YOUR STORED PROCEDURE
CREATE TYPE IdsTableType AS TABLE 
  ( id INT );
GO

-- DECLARE PROCEDURE
CREATE PROCEDURE [dbo].[filterOnIds]
	-- Add the parameters for the stored procedure here
	@Ids IdsTableType READONLY
AS
BEGIN

-- YOUR CODE

END

{% endhighlight %}

You might try to call it like this, using the basic Dapper functionality that you're used to:

{% highlight c# %}
myConnection.Query<returnType>("dbo.filterOnIds",new { ids = myList });
{% endhighlight %}

But this will of course not work, and that's why you're reading this. The solution isn't that hard but finding Dapper examples on the internet can be quite time consuming/frustrating. So lets write some code:

{% highlight c# %}
public class IdListParam : Dapper.SqlMapper.IDynamicParameters
{
	private IEnumerable<int> _ids;

	public IdListParam(IEnumerable<int> ids)
	{
		_ids = ids;
	}

  //This is from the IDynamicParameters implementation
  public void AddParameters(System.Data.IDbCommand command, Dapper.SqlMapper.Identity identity)
  {
    var sqlCommand = (SqlCommand)command;
    sqlCommand.CommandType = System.Data.CommandType.StoredProcedure;

    List<SqlDataRecord> idList = new List<SqlDataRecord>();

    SqlMetaData[] tvp_definition = { new SqlMetaData("n", SqlDbType.Int) };

    foreach (int n in _accountStructureIds)
    {
      // Create a new record, using the metadata array above.
      SqlDataRecord rec = new SqlDataRecord(tvp_definition);
      rec.SetInt32(0, n);    // Set the value.
      idList.Add(rec);      // Add it to the list.
    }

    var p = sqlCommand.Parameters.Add("@Ids", SqlDbType.Structured);
    p.Direction = ParameterDirection.Input;
    p.TypeName = "IdsTableType";
    p.Value = idList;
  }
}
{% endhighlight %}

But as I said, this is a one-off implementation with no dynamic input. If you're okay with having maybe one or two implementations of this style in your code then that's okay, simply add parameters to the constructor as needed and add them to the command in the ``AddParameters`` method. Or you could extend it to take a ``Dynamic`` object in the constructor and iterate over its properties, creating parameters on the fly. I would consider the second option if you use TVP a lot in your stored procedures and that most of your other params are of a few normal types such as INT and NVARCHAR. This could easibly be a project in itself if you want to catch every single use case in a single implementation.