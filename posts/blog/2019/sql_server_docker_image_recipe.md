date: 2019.12.03
title: A short recipe for setting up the Microsoft SQL Server docker image
series: advent_calendar_2019
unlisted: true

That's a lot of Microsoft stuff so far! This one is more of a coincidence. 

We're moving from Oracle to SQL Server at my current client. So far, so good. There's nothing I like better in Oracle than in SQL Server. In fact, there's a lot to like about SQL Server. The driver code is open source, for example, so when Weird Stuff happens in our app, we can look at the source code of the driver itself in the stack traces and see what it's up to.

Anyway. The docker image.

The Dockerfile itself is pretty plain.

<pre><code data-lang="dockerfile">
FROM mcr.microsoft.com/mssql/server:2019-GA-ubuntu-16.04
ENV ACCEPT_EULA y
ENV SA_PASSWORD MyFancyPassword123
COPY ./init.sql .
COPY ./entrypoint.sh .
EXPOSE 1433
CMD /bin/bash ./entrypoint.sh
</code></pre>

Obviously, you have to make sure you actually [accept the EULA](https://go.microsoft.com/fwlink/?LinkId=746388).

The `init.sql` file can have whatever SQL you want in it, to set it up. Here's a good starting point.

<pre><code data-lang="sql">
CREATE DATABASE myapp;
go

USE myapp;
go

CREATE LOGIN myapp_login WITH PASSWORD='My_App_1234', DEFAULT_DATABASE=myapp;
go

CREATE USER myapp FOR LOGIN myapp_login WITH DEFAULT_SCHEMA=dbo;
go

ALTER ROLE db_owner ADD MEMBER myapp;
go
</code></pre>

The interesting part is the entrypoint.

The main difficulty here is to set up the docker image so that the init script runs at startup. The PostgreSQL docker image has a neat API where you can put sql scripts or shell scripts in `/docker-entrypoint-initdb.d/` (PostgreSQL only). SQL Server has nothing like that, so we have to do something else.

Thankfully, Microsoft has documentet a stable API for how to start the actual SQL Server instance. So we can use that to start it manually, and override the built-in entrypoint. 

Here's `entrypoint.sh`:

<pre><code data-lang="sh">
#!/bin/bash

# Run init-script with long timeout - and make it run in the background
/opt/mssql-tools/bin/sqlcmd -S localhost -l 60 -U SA
 \ -P "MyFancyPassword123" -i init.sql &
# Start SQL server
/opt/mssql/bin/sqlservr
</code></pre>

The last part is the default entry point. By running sqlcmd with a 60 second timeout and pointing it to `init.sql`, and immediately backgrounding it with that `&` in there, we're making sure that the `init.sql` script runs on startup, and that the docker file is properly started up.

That's about it!