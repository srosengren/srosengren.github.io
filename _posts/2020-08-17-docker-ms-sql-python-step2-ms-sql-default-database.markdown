---
layout: post
title:  "Using MS SQL Server with Python and docker: MS SQL default database in docker"
date:   2020-08-17 17:08:00
tags: [development,sql server, docker]
---

## Problem
This is a continuation on [This blogpost](/blog/docker-ms-sql-python-step1-ms-sql-docker). But now we've come to the step we're I want to add a default database when the container starts for my application to connect to. When doing this with .NET Core there's an option for creating a database if it doesn't exist, but no such luck for us here. I also want the responsibility of this on the database container, and not on the application layer.

## Solution
To do this we must update our previous solution quite a bit. In the first post we got by by using the provided MS SQL docker image as is, without doing anything ourselves. But in order to implement this requirement we must create our own image, based on the MS SQL one.

To do this we create a `Dockerfile` with a single line:

{% highlight bash %}
FROM mcr.microsoft.com/mssql/server:2017-CU21-ubuntu-16.04
{% endhighlight %}

This will create a new image based on the argument to `FROM`, to use this instead of the original image, we must also update our compose file.

{% highlight yaml %}
...
services:
  database:
    # image: mcr.microsoft.com/mssql/server:2017-CU21-ubuntu-16.04
    build: {folder that contains our new dockerfile}
...
{% endhighlight %}

We're removing the `image` property and replaces it with the `build` property, this points to the folder that contains our new dockerfile, I've opted to have my images in different folders to keep their configurations separate. Now we're on our way, but nothing's different if we try to run `docker-compose up`. We will have to make a couple of more changes to get the result we're after.

`Dockerfile`:
{% highlight bash %}
FROM mcr.microsoft.com/mssql/server:2017-CU21-ubuntu-16.04

# The SQL Server image runs as the mssql user, switch to root for file operations
# USER root

COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY setup.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/setup.sh

# Switch back to the mssql user, otherwise the SQL Server startup will fail.
# USER mssql

ENTRYPOINT ["entrypoint.sh"]
{% endhighlight %}

One thing to note here are the commented out `USER` statements, if you're using a SQL Server 2019 image, then you need those as that image runs a the user `mssql`, and that user won't be able to run the copy commands. You will also need to change `chmod +x ...` to `chmod ugo+x ...` as we need the `mssql` user to be able to execute the files.

Our `Dockerfile` now references 2 new files, `setup.sh`, and `entrypoint.sh`.

- `entrypoint.sh`: This command (in our case, defering it to a file), is responsible for running a startup command when a container which uses this image starts up.

{% highlight bash %}
#!/bin/bash

# setup.sh execution must come first as it's a terminating command
# And we need the last command to be indefinite to not stop the container,
# hence starting the SQL Server service last.
setup.sh & /opt/mssql/bin/sqlservr
{% endhighlight %}

This will run our setup, and start the sql server.

- `setup.sh`: This is a custom file where we will keep the logic for actually creating a database on startup.

{% highlight bash %}
#run the setup script to create the DB
#do this in a loop because the timing for when the SQL instance is ready is indeterminate
for i in {1..25};
do
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P {secret-password} -d master -q "CREATE DATABASE {name of your database}"
    if [ $? -eq 0 ]
    then
        echo "Database created"
        break
    else
        echo "SQL server not up yet..."
        sleep 2
    fi
done
{% endhighlight %}

Here we're trying to create a database, which we're doing in a loop as we won't know when the service is up and running. The `{secret-password}` should be the one that you've specified in your `docker-compose` file from the first blog post.

Now we have a setup that will create a new database if it doesn't exist. Important to note is that other services that you start with `docker-compose up` won't wait for the creation of this database, even if you use `depends_on` in your `docker-compose` file.

## Resources used when finding this solution
- [https://github.com/twright-msft/mssql-node-docker-demo-app](https://github.com/twright-msft/mssql-node-docker-demo-app)
- [https://docs.docker.com/engine/reference/builder/](https://docs.docker.com/engine/reference/builder/)
- [https://docs.docker.com/compose/compose-file/](https://docs.docker.com/compose/compose-file/)
- [https://github.com/microsoft/mssql-docker](https://github.com/microsoft/mssql-docker)