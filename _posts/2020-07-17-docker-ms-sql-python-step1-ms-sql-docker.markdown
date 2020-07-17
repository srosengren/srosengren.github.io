---
layout: post
title:  "Using MS SQL Server with Python and docker: MS SQL in docker compose"
date:   2020-07-17 12:08:00
tags: [development,sql server, docker]
---

## Problem
I'm currently in a team that's developing an app with a python backend, that's deployed to Azure with a MS SQL Server as a database, but uses a SQLite database for local development. This creates issues with having different capabilities and slightly different syntax/rules/keywords.

One good thing is that we're already using docker for local development, making adding SQL Server an easy addition.

## Solution
First things first, make sure that you have a `docker-compose.yml` file that will contain your docker compose configuration. You will find the reference for compose files [here](https://docs.docker.com/compose/compose-file/). If you aren't using an existing project, then here's a basic template that will provide you with a SQL Server running in docker once we're done, but nothing more.

{% highlight yaml %}
version: '3'

services:
 # Here we'll add our services, including our sql server
{% endhighlight %}

The next step would be to visit [https://hub.docker.com/_/microsoft-mssql-server](https://hub.docker.com/_/microsoft-mssql-server) to find which version of SQL Server that you want to use. This page also has a few examples of running a docker container using the image without including it in compose. In my case I chose `2019-CU5-ubuntu-16.04` as I want the 2019 SQL Server, and I want to lock it to Ubuntu 16.04 instead of using "latest".

We're now ready to add SQL Server as a service to our compose, making our compose file look like this.

{% highlight yaml %}
version: '3'

services:
  database:
    container_name: {static-name-of-our-database-container}
    image: mcr.microsoft.com/mssql/server:2019-CU5-ubuntu-16.04
    ports:
      - "1433:1433"
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD={secret-password}
      - MSSQL_PID=Developer
{% endhighlight %}

This is actually our complete file, let's walk through it:
- `database`: This is the name of our service.
    - `container_name`: Setting this explicitly allows us to reference it later on when connecting to it, either through code, or through a management tool. This is otherwise generated automatically based on the name of your app, and the name of your service. Setting this explicitly will however block us from scaling to more than one container of this service [https://docs.docker.com/compose/compose-file/#container_name](https://docs.docker.com/compose/compose-file/#container_name). This is fine by me when running it locally while developing without any orchestration.
    - `image`: This is the `{image}:{tag}` that we want to use for this container. In our case the image is SQL Server, and the tag is the specific version that we want to use.
    - `ports`: These are the port mappings that we want to want to expose from our dockers app internal network, to the machine that's running docker (our computer). In this case we're exposing port 1433 (SQL Server default port) to our machine, allowing us to connect to it using a tool such as Sql Server Management Studio, Azure Data Studio, or a CLI. The format of these mappings are `HOST:CONTAINER`, for full reference see [Docker compose:ports](https://docs.docker.com/compose/compose-file/#ports), or do a deep dive into [networking in docker compose](https://docs.docker.com/compose/networking/)
    - `environments`
        - `ACCEPT_EULA`: This makes sure that you don't need to stop to accept the EULA.
        - `SA_PASSWORD`: The password of your new SQL Servers `sa` account, this must adhere to [SQL Server password requirements](https://docs.microsoft.com/en-us/sql/relational-databases/security/password-policy?view=sql-server-ver15)
        - `MSSQL_PID`: This tells the SQL Server image which version of SQL Server we want to use, the default is `Developer`, but I'm a fan of setting these kind of settings explicitly to tell others that this is the actual value I want.

### Connecting to the database
We may now start our docker app by running `docker-compose up --build` in our terminal (from the folder where our `docker-compose.yml` resides).

Once started we may connect to the database using our favorite tool such as Sql Server Management Studio, Azure Data Studio, CLI, or any other tool that are able to connect to a SQL Server 2019 server using the following connection parameters:
- Server/Host: localhost,1433
- User name: sa
- Password: {What you used for `SA_PASSWORD` in your `docker-compose.yml`}

## Resources used when finding this solution
- [Quickstart: Run SQL Server container images with Docker](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker?view=sql-server-ver15&pivots=cs1-bash)
- [How to run SQL Server in a Docker container](https://blog.logrocket.com/how-to-run-sql-server-in-a-docker-container/)
- [Docker Compose Sqlserver](https://www.kimsereylam.com/docker/2018/10/05/docker-compose-sqlserver.html)
- [Docker compose file]((https://docs.docker.com/compose/compose-file/)) 
- [https://docs.docker.com/compose/aspnet-mssql-compose/](https://docs.docker.com/compose/aspnet-mssql-compose/)