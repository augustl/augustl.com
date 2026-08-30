---
title: "DevOps: The magic of going back in time with Datomic"
date: "2019-12-04"
content_format: "markdown"
series: "advent_calendar_2019"
---
I'm a bit of a [Datomic](https://www.datomic.com/) fan. That's a bit of an understatement.

I'm going to tell you a DevOps story today, about Marzia and Felix. They are both DevOps experts, delivering quality software at breakneck speeds. Marzia uses Datomic, and Felix uses PostgreSQL. Let's see how their DevOps acts out in the world.

## It's 11:30 pm, almost midnight

Felix is sleeping.

**The System** is operational. Everything is running A-OK. No alerts are triggered, no warnings are active. 

Earlier today, Felix deployed to production. Four times, actually! DevOps, yay!

**The System** receives orders from many different systems in the organization. Felix is experienced and knows that stuff can go wrong, so he has created an audit log table in postgres that stores all the incoming orders. It's great to be able to replay orders that goes wrong. 

It's _possible_ that **The System** has a complete meltdown and that orders are missed - but that doesn't matter. What matters, is that when everything is up and running, and some validation error or other software bug fails to process the order, it can simply be reprocessed by finding it in the orders audit log.

It's 11:30pm. An order fails.

Nobody is alerted. This is just normal business. The different system that posted the order to us got an error message back. It's their responsibility to retry until it works.
 
## It's 08:41 am, the next day

Felix just arrived at the office.

The Boss asks Felix why the order failed. It was an important order, and the system that sent it to us hasn't retried it.

Cool! We have an audit log, so let's try! We just send it again. We don't have to spend time digging in the logs to find the first failure.

It succeeds.

(Have you ever told yourself: "damn, I wish it didn't work?". That's normal. It happens to engineers all the time.)

Felix is told that The Boss changed some of the rules in the admin setup this morning, before Felix arrived. The admin setup is very powerful and flexible. Lots of grids and configs to tweak and adjust how orders are processed.

Oh well. It worked. We're not sure why it failed.

Moving on to other things!

## It's 11:30 pm, almost midnight.

Marzia is sleeping.

**The Other System** is operational. Everything is running A-OK. No alerts are triggered, no warnings are active.

Earlier today, Marzia deployed to production. Four times, actually! DevOps, yay!

**The Other System** receives orders from many different systems in the organization. Marzia is a fan of Datomic, so she stores all the rules about how to process orders, and all the data about the orders themselves, as well as the raw input data that **The Other System** receives, in Datomic. 

They use redis for some other things, and Riak as well. It's nice to be able to use different databases with different semantics for different parts of **The Other System**.

It's 11:30pm. An order fails.

Nobody is alerted. This is just normal business. The different system that posted the order to us got an error mesage back. It's their responsibility to retry until it works.

## It's 08:41 am, the next day

Marzia just arrived at the office.

The Boss asks Marzia why the order failed. It was an important order, and the system that sent it to us hasn't retried it.

Cool! Marzia stores all order related information in Datomic, so we have full access to the historical information about all the data in our system.

(Say what?)

Marzia is told that The Boss changed some of the rules in the admin setup this morning, before Marzia arrived.

Marzia finds the transaction where the boss changed the rules.

(Say _what??_)

<pre><code class="highlight"><span class="c1">;; Finds all transactions by boss-user</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nf">d/q</span> <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="p">[</span><span class="nv">?tx</span> <span class="nv">...</span><span class="p">]</span>
            <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?boss-id</span>
            <span class="ss">:where</span>
            <span class="p">[</span><span class="nv">?tx</span> <span class="ss">:tx/changed-by</span> <span class="nv">?boss-id</span><span class="p">]]</span>
       <span class="p">(</span><span class="nf">d/history</span> <span class="nv">db-3</span><span class="p">)</span>
       <span class="p">(</span><span class="ss">:db/id</span> <span class="nv">boss-user</span><span class="p">))</span>
     <span class="c1">;; Get the last 3 ones</span>
     <span class="p">(</span><span class="nf">sort</span><span class="p">)</span>
     <span class="p">(</span><span class="nf">reverse</span><span class="p">)</span>
     <span class="p">(</span><span class="nb">take </span><span class="mi">3</span><span class="p">)</span>
     <span class="p">(</span><span class="nf">map</span>
       <span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">tx</span><span class="p">]</span>
              <span class="c1">;; Get raw data from transaction log for this tx</span>
         <span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nf">d/tx-range</span> <span class="nv">db-log</span> <span class="nv">tx</span> <span class="p">(</span><span class="nb">inc </span><span class="nv">tx</span><span class="p">))</span>
              <span class="p">(</span><span class="nf">first</span><span class="p">)</span>
              <span class="ss">:data</span>
              <span class="c1">;; Remove noise we don't want</span>
              <span class="p">(</span><span class="nb">filter </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">e</span> <span class="nv">a</span> <span class="nv">v</span> <span class="nv">t</span> <span class="nv">added?</span><span class="p">]]</span> <span class="p">(</span><span class="nb">and </span><span class="nv">added?</span> <span class="p">(</span><span class="nb">not= </span><span class="nv">e</span> <span class="nv">tx</span><span class="p">))))</span>
              <span class="c1">;; Give us the good stuff</span>
              <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">e</span> <span class="nv">a</span> <span class="nv">v</span><span class="p">]]</span>
                     <span class="p">{</span><span class="ss">:id</span> <span class="nv">e</span>
                      <span class="ss">:attr</span> <span class="p">(</span><span class="nf">d/ident</span> <span class="nv">db-3</span> <span class="nv">a</span><span class="p">)</span>
                      <span class="ss">:val</span> <span class="nv">v</span><span class="p">}))))))</span></code></pre>

Marzia could have asked for more than the 3 latest ones, but decided that 3 was a good start. Here's what Marzia gets back from that query.

<pre><code class="highlight"><span class="p">({</span><span class="ss">:timestamp</span> <span class="o">#</span><span class="nv">inst</span><span class="s">"2019-11-28T07:54:28.102-00:00"</span>,
  <span class="ss">:changes</span> 
  <span class="p">({</span><span class="ss">:id</span> <span class="mi">17592186045421</span>, 
    <span class="ss">:attr</span> <span class="ss">:order-rule/zip-code</span>, <span class="ss">:val</span> <span class="s">"0061"</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">}</span>
   <span class="p">{</span><span class="ss">:id</span> <span class="mi">17592186045421</span>, 
     <span class="ss">:attr</span> <span class="ss">:order-rule/zip-code</span>, <span class="ss">:val</span> <span class="s">"0056"</span>, <span class="ss">:added?</span> <span class="nv">false</span><span class="p">})}</span>
   
 <span class="p">{</span><span class="ss">:timestamp</span> <span class="o">#</span><span class="nv">inst</span><span class="s">"2019-11-28T07:53:58.031-00:00"</span>,
   <span class="ss">:changes</span> 
   <span class="p">({</span><span class="ss">:id</span> <span class="mi">17592186092838</span>, 
     <span class="ss">:attr</span> <span class="ss">:customer/name</span>, <span class="ss">:val</span> <span class="s">"Some Flower Shop"</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">}</span>
    <span class="p">{</span><span class="ss">:id</span> <span class="mi">17592186092838</span>, 
     <span class="ss">:attr</span> <span class="ss">:customer/department</span>, <span class="ss">:val</span> <span class="mi">17592186860812</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">})}</span>
    
 <span class="p">{</span><span class="ss">:timestamp</span> <span class="o">#</span><span class="nv">inst</span><span class="s">"2019-11-28T07:52:01.511-00:00"</span>,
   <span class="ss">:changes</span> 
   <span class="p">({</span><span class="ss">:id</span> <span class="mi">17592186089123</span>, 
     <span class="ss">:attr</span> <span class="ss">:customer/name</span>, <span class="ss">:val</span> <span class="s">"Some Office"</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">}</span>
    <span class="p">{</span><span class="ss">:id</span> <span class="mi">17592186089123</span>, 
      <span class="ss">:attr</span> <span class="ss">:customer/name</span>, <span class="ss">:val</span> <span class="s">"Some Offcie"</span>, <span class="ss">:added?</span> <span class="nv">false</span><span class="p">})})</span></code></pre>

Marzia found it! The query yielded three transactions, performed around 07:55. The oldest one fixed a spelling error in a customer name, the second one added a new customer and set its name and assigned it to a department, and the most recent one changed an `:order-rule/zip-code` from "0056" to "0061".

Marzia knows that the zip code is important to the routing, and the change of zip codes triggered some rules that were changed by a code change the day before.

And the order that failed was related to the department that order rule is assigned to.

<pre><code class="highlight"><span class="p">(</span><span class="nf">d/q</span>
  <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="p">[</span><span class="nv">?rule-id</span> <span class="nv">...</span><span class="p">]</span>
    <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?order-id</span>
    <span class="ss">:where</span>
    <span class="p">[</span><span class="nv">?order-id</span> <span class="ss">:order/zip-code</span> <span class="nv">?zip-code</span><span class="p">]</span>
    <span class="p">[</span><span class="nv">?rule-id</span> <span class="ss">:order-rule/zip-code</span> <span class="nv">?zip-code</span><span class="p">]]</span>
  <span class="nv">db</span>
  <span class="nv">failed-order-id</span><span class="p">)</span>  
<span class="c1">;; =&gt; #{17592186045421}</span></code></pre>


Jut to be on the safe side, Marzia checks that the order rule in question was actually associated with the same department around the time the order failed. This can be done easily, by running the same query again, but running it with the database `as-of` a provided timestamp.

<pre><code class="highlight"><span class="p">(</span><span class="nf">d/q</span>
  <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="p">[</span><span class="nv">?rule-id</span> <span class="nv">...</span><span class="p">]</span>
    <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?order-id</span>
    <span class="ss">:where</span>
    <span class="p">[</span><span class="nv">?order-id</span> <span class="ss">:order/zip-code</span> <span class="nv">?zip-code</span><span class="p">]</span>
    <span class="p">[</span><span class="nv">?rule-id</span> <span class="ss">:order-rule/zip-code</span> <span class="nv">?zip-code</span><span class="p">]]</span>
  <span class="p">(</span><span class="nf">d/as-of</span> <span class="nv">db</span> <span class="o">#</span><span class="nv">inst</span> <span class="s">"2019-11-27T23:30:00.000"</span><span class="p">)</span>
  <span class="nv">failed-order-id</span><span class="p">)</span>  
<span class="c1">;; =&gt; #{17592186045421}</span></code></pre>

Marzia could also have checked the full history, in case it changed departments rapidly back and forth for some reason, but decides to leave it at that. 


## Retrospective

Felix had an audit log, but not much else.

Marzia queried the Datomic database, and had all the info readily available.

Datomic keeps the history for _all_ the changes across the database over time. Datomic also treats transactions as first class entities, so the only "clever" thing that was done here was to make sure to tag transactions with the user that performed the change, so that it's easy to find that later on.

<pre><code class="highlight"><span class="p">(</span><span class="nf">d/transact</span> <span class="nv">conn</span> 
  <span class="p">[[</span><span class="ss">:db/add</span> <span class="p">(</span><span class="ss">:db/id</span> <span class="nv">my-order-rule</span><span class="p">)</span> <span class="ss">:order-rule/zip-code</span> <span class="s">"0061"</span><span class="p">]</span>
   <span class="p">[</span><span class="ss">:db/add</span> <span class="s">"datomic.tx"</span> <span class="ss">:tx/changed-by</span> <span class="p">(</span><span class="ss">:db/id</span> <span class="nv">boss-user</span><span class="p">)]])</span></code></pre>

This is a DevOps superpower. You can track your data as it changes and churns, across deploys and code changes, and all the way back to the beginning of time. And it's just there, out of the box, you don't have to think up the use cases for time tracking up front.

You can and should create audit logs. But it's super nice to be able to have _all_ of the data that governs your system with change tracking.

You do it with your source code. You do it with your log files. You should also do it with critical business data.
