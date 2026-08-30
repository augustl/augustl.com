---
title: "A short recipe for setting up the Microsoft SQL Server docker image"
date: "2019-12-10"
content_format: "markdown"
archive_order: 11
series: "advent_calendar_2019"
---
More Microsoft stuff.

At my current client, we're in the process of moving from Oracle to SQL Server. So far so good!  In fact, there's a lot to like about SQL Server. The driver code is open source, for example, so when Weird Stuff happens in our app, we can look at the source code of the driver itself in the stack traces and see what it's up to.

Anyway. The docker image.

The Dockerfile itself is pretty plain.

<pre><code class="highlight"><span class="k">FROM</span><span class="s"> mcr.microsoft.com/mssql/server:2019-GA-ubuntu-16.04</span>
<span class="k">ENV</span> ACCEPT_EULA y
<span class="k">ENV</span> SA_PASSWORD MyFancyPassword123
<span class="k">COPY</span> ./init.sql .
<span class="k">COPY</span> ./entrypoint.sh .
<span class="k">EXPOSE</span><span class="s"> 1433</span>
<span class="k">CMD</span> /bin/bash ./entrypoint.sh</code></pre>

Obviously, you have to make sure you actually [accept the EULA](https://go.microsoft.com/fwlink/?LinkId=746388).

The `init.sql` file can have whatever SQL you want in it, to set it up. Here's a good starting point.

<pre><code class="highlight"><span class="k">CREATE</span> <span class="k">DATABASE</span> <span class="n">myapp</span><span class="p">;</span>
<span class="k">go</span>

<span class="n">USE</span> <span class="n">myapp</span><span class="p">;</span>
<span class="k">go</span>

<span class="k">CREATE</span> <span class="n">LOGIN</span> <span class="n">myapp_login</span> <span class="k">WITH</span> <span class="n">PASSWORD</span><span class="o">=</span><span class="s1">'My_App_1234'</span><span class="p">,</span> <span class="n">DEFAULT_DATABASE</span><span class="o">=</span><span class="n">myapp</span><span class="p">;</span>
<span class="k">go</span>

<span class="k">CREATE</span> <span class="k">USER</span> <span class="n">myapp</span> <span class="k">FOR</span> <span class="n">LOGIN</span> <span class="n">myapp_login</span> <span class="k">WITH</span> <span class="n">DEFAULT_SCHEMA</span><span class="o">=</span><span class="n">dbo</span><span class="p">;</span>
<span class="k">go</span>

<span class="k">ALTER</span> <span class="k">ROLE</span> <span class="n">db_owner</span> <span class="k">ADD</span> <span class="n">MEMBER</span> <span class="n">myapp</span><span class="p">;</span>
<span class="k">go</span></code></pre>

The interesting part is the entrypoint.

The main difficulty here is to set up the docker image so that the init script runs at startup. The PostgreSQL docker image has a neat API where you can put sql scripts or shell scripts in `/docker-entrypoint-initdb.d/` (PostgreSQL only). SQL Server has nothing like that, so we have to do something else.

Thankfully, Microsoft has documentet a stable API for how to start the actual SQL Server instance. So we can use that to start it manually, and override the built-in entrypoint. 

Here's `entrypoint.sh`:

<pre><code class="highlight"><span class="ch">#!/bin/bash</span>

<span class="c1"># Run init-script with long timeout - and make it run in the background</span>
/opt/mssql-tools/bin/sqlcmd -S localhost -l <span class="m">60</span> -U SA
 <span class="se">\ </span>-P <span class="s2">"MyFancyPassword123"</span> -i init.sql <span class="p">&amp;</span>
<span class="c1"># Start SQL server</span>
/opt/mssql/bin/sqlservr</code></pre>

The last part is the default entry point. By running sqlcmd with a 60 second timeout and pointing it to `init.sql`, and immediately backgrounding it with that `&` in there, we're making sure that the `init.sql` script runs on startup, and that the docker file is properly started up.

That's about it!
