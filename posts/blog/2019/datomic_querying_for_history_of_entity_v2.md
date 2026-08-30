---
title: "Datomic: Querying for the history of an entity (v2)"
date: "2019-06-11"
content_format: "markdown"
archive_order: 22
series: "datomic"
---
This is the updated and rewritten version of an [old classic](https://augustl.com/blog/2013/querying_datomic_for_history_of_entity/).

## Intro: how is this even possible?

Datomic makes it easy to implement an "audit log" of changes over time to anything in your system.

You _could_ implement your own. But when you have Datomic, you are one abstraction level above other databases. And there are [many ways to get that wrong](https://augustl.com/blog/2018/datomic_look_at_all_the_things_i_am_not_doing/). So you don't have to think of this when modelling your data. The power is already there. You just have to know how to query the data out of Datomic.

## The history database

Normally, you transact facts into your database, and your schema determines what the "current view" of the database is like.

Let's say we have the following history of transactions:

<pre><code class="highlight"><span class="c1">;; The three transactions that we write to the database</span>

<span class="c1">;; tx 1</span>
<span class="p">[[</span><span class="ss">:db/add</span> <span class="mi">1</span> <span class="ss">:user/email</span> <span class="s">"august@augustl.com"</span><span class="p">]</span> <span class="p">[</span><span class="ss">:db/add</span> <span class="mi">1</span> <span class="ss">:user/password</span> <span class="s">"hash-here"</span><span class="p">]]</span>

<span class="c1">;; tx 2</span>
<span class="p">[[</span><span class="ss">:db/add</span> <span class="mi">1</span> <span class="ss">:user/subscribed-to-newsletter?</span> <span class="nv">true</span><span class="p">]]</span>

<span class="c1">;; tx 3</span>
<span class="p">[[</span><span class="ss">:db/add</span> <span class="mi">1</span> <span class="ss">:user/email</span> <span class="s">"august@kodemaker.no"</span><span class="p">]]</span></code></pre>

We pull out a view of the database:

<pre><code class="highlight"><span class="c1">;; Set up</span>
<span class="p">(</span><span class="nf">require</span> <span class="o">'</span><span class="p">[</span><span class="nv">datomic.api</span> <span class="ss">:as</span> <span class="nv">d</span><span class="p">])</span>

<span class="p">(</span><span class="k">def </span><span class="nv">my-db</span> <span class="p">(</span><span class="nf">d/db</span> <span class="nv">my-conn</span><span class="p">))</span>

<span class="p">(</span><span class="k">def </span><span class="nv">my-eid</span> <span class="mi">123654</span><span class="p">)</span> <span class="c1">;; The assumed entity ID created above (`[:db/add 1 ...]`)</span></code></pre>

When you query `my-db`, you'll see a "current view" of the data, without any history. If you ask the db for the `:user/email` of user `1`` you'll get:

<pre><code class="highlight"><span class="c1">;; Just "latest data"</span>
<span class="p">(</span><span class="nf">d/q</span> <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?email</span> <span class="ss">:in</span> <span class="nv">$db</span> <span class="nv">?eid</span> <span class="ss">:where</span> <span class="p">[</span><span class="nv">?eid</span> <span class="ss">:user/email</span> <span class="nv">?email</span><span class="p">]]</span> <span class="nv">my-db</span> <span class="nv">my-eid</span><span class="p">)</span>
<span class="c1">;; =&gt; returns</span>
<span class="o">#</span><span class="p">{[</span><span class="s">"august@kodemaker.no"</span><span class="p">]}</span></code></pre>

However, you can also ask for the "history" db. If you ask _that_ for the value of the `:user/email` of user `1`` you'll get:

<pre><code class="highlight"><span class="c1">;; All historical data, just like that!</span>
<span class="p">(</span><span class="k">def </span><span class="nv">my-history-db</span> <span class="p">(</span><span class="nf">d/history</span> <span class="nv">my-db</span><span class="p">))</span>

<span class="p">(</span><span class="nf">d/q</span> <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?email</span> <span class="ss">:in</span> <span class="nv">$db</span> <span class="nv">?eid</span> <span class="ss">:where</span> <span class="p">[</span><span class="nv">?eid</span> <span class="ss">:user/email</span> <span class="nv">?email</span><span class="p">]]</span> <span class="nv">my-history-db</span> <span class="nv">my-eid</span><span class="p">)</span>
<span class="c1">;; =&gt; returns</span>
<span class="o">#</span><span class="p">{[</span><span class="s">"august@augustl.com"</span><span class="p">]</span> <span class="p">[</span><span class="s">"august@kodemaker.no"</span><span class="p">]}</span></code></pre>

The "history" db is a special view of the database that doesn't filter out previously added data.

## Inspect the history

All Datomic facts contains information about which transaction the fact was added in. This is particularly useful for querying the history database.

This query will return a list of all changes made to the entity`, with information about the transaction in where it was added, the attribute in question, and whether that attribute was added or removed in that transaction.

<pre><code class="highlight"><span class="c1">;; All changes made to entity my-eid</span>
<span class="p">(</span><span class="k">def </span><span class="nv">res</span>
  <span class="p">(</span><span class="nf">d/q</span>
    <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?tx</span> <span class="nv">?attr</span> <span class="nv">?added</span>
      <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?e</span>
      <span class="ss">:where</span>
      <span class="p">[</span><span class="nv">?e</span> <span class="nv">?attr</span> <span class="nv">_</span> <span class="nv">?tx</span> <span class="nv">?added</span><span class="p">]]</span>
    <span class="p">(</span><span class="nf">d/history</span> <span class="nv">db</span><span class="p">)</span>
    <span class="nv">my-eid</span><span class="p">))</span>
<span class="c1">;; =&gt; returns</span>
<span class="o">#</span><span class="p">{[</span><span class="mi">13194139534318</span> <span class="mi">63</span> <span class="nv">true</span><span class="p">]</span>
  <span class="p">[</span><span class="mi">13194139534313</span> <span class="mi">63</span> <span class="nv">true</span><span class="p">]</span>
  <span class="p">[</span><span class="mi">13194139534317</span> <span class="mi">65</span> <span class="nv">true</span><span class="p">]</span>
  <span class="p">[</span><span class="mi">13194139534313</span> <span class="mi">64</span> <span class="nv">true</span><span class="p">]</span>
  <span class="p">[</span><span class="mi">13194139534318</span> <span class="mi">63</span> <span class="nv">false</span><span class="p">]}</span></code></pre>

This data structure is pretty bare metal. What follows are some examples of how to use it.
 
## Making sense of the daa

We don't really do anything here other than restructuring the data to make it look more intuitive.
 
<pre><code class="highlight"><span class="c1">;; More prettier</span>
<span class="p">(</span><span class="k">def </span><span class="nv">txs</span>
  <span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="nv">res</span>
       <span class="p">(</span><span class="nf">group-by</span> <span class="nv">first</span><span class="p">)</span>
       <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">k</span> <span class="nv">v</span><span class="p">]]</span> <span class="p">[</span><span class="nv">k</span> <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">tx</span> <span class="nv">attr</span> <span class="nv">added</span><span class="p">]]</span> <span class="p">{</span><span class="ss">:attr</span> <span class="nv">attr</span> <span class="ss">:added?</span> <span class="nv">added</span><span class="p">})</span> <span class="nv">v</span><span class="p">)]))</span>
       <span class="p">(</span><span class="nb">sort-by </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">k</span> <span class="nv">v</span><span class="p">]]</span> <span class="nv">k</span><span class="p">))))</span>
<span class="c1">;; =&gt; returns</span>
<span class="p">([</span><span class="mi">13194139534313</span> <span class="p">({</span><span class="ss">:attr</span> <span class="mi">63</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">}</span> <span class="p">{</span><span class="ss">:attr</span> <span class="mi">64</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">})]</span>
 <span class="p">[</span><span class="mi">13194139534317</span> <span class="p">({</span><span class="ss">:attr</span> <span class="mi">65</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">})]</span>
 <span class="p">[</span><span class="mi">13194139534318</span> <span class="p">({</span><span class="ss">:attr</span> <span class="mi">63</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">}</span> <span class="p">{</span><span class="ss">:attr</span> <span class="mi">63</span>, <span class="ss">:added?</span> <span class="nv">false</span><span class="p">})])</span></code></pre>

Here we se the three transactions we did above. The first transaction contains the two "added" items, the email and the password. The second transaction contains the added newsletter subscription. The third transaction contains the removed old e-mail and the added new e-mail.
 
You can use this query power to do lots of neat things.

It also exposes an interesting detail about Datomic internals. Attributes themselves (`?attr`) are _also_ represented entities in the Datomic database, and can be queried fully. As well as the transactions themselves, of course.

## Generate a list of entities before/after, whith a timestamp

Our raw data is not that interesting, so let's do something about that.

<pre><code class="highlight"><span class="c1">;; List of changes, with the full entity as of before and after the change was made</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="nv">res</span>
     <span class="p">(</span><span class="nb">map </span><span class="nv">first</span><span class="p">)</span>
     <span class="p">(</span><span class="nf">set</span><span class="p">)</span>
     <span class="p">(</span><span class="nf">sort</span><span class="p">)</span>
     <span class="p">(</span><span class="nf">map</span>
       <span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">tx-eid</span><span class="p">]</span>
         <span class="p">(</span><span class="k">let </span><span class="p">[</span><span class="nv">tx</span> <span class="p">(</span><span class="nf">d/entity</span> <span class="nv">my-db</span> <span class="nv">tx-eid</span><span class="p">)]</span>
           <span class="p">{</span><span class="ss">:timestamp</span> <span class="p">(</span><span class="ss">:db/txInstant</span> <span class="nv">tx</span><span class="p">)</span>
            <span class="ss">:ent-before</span> <span class="p">(</span><span class="nf">d/entity</span> <span class="p">(</span><span class="nf">d/as-of</span> <span class="nv">my-db</span> <span class="p">(</span><span class="nb">dec </span><span class="p">(</span><span class="nf">d/tx-&gt;t</span> <span class="nv">tx-eid</span><span class="p">)))</span> <span class="nv">my-eid</span><span class="p">)</span>
            <span class="ss">:ent-after</span> <span class="p">(</span><span class="nf">d/entity</span> <span class="p">(</span><span class="nf">d/as-of</span> <span class="nv">my-db</span> <span class="nv">tx-eid</span><span class="p">)</span> <span class="nv">my-eid</span><span class="p">))})))</span></code></pre>

Here's what we get back

<pre><code class="highlight"><span class="c1">;; =&gt; returns</span>
<span class="p">(</span>
<span class="c1">;; The first TX</span>
<span class="p">{</span><span class="ss">:timestamp</span> <span class="o">#</span><span class="nv">inst</span><span class="s">"2019-06-11T13:53:09.055-00:00"</span>,
  <span class="ss">:ent-before</span> <span class="o">#</span><span class="ss">:db</span><span class="p">{</span><span class="ss">:id</span> <span class="mi">17592186045418</span><span class="p">}</span>,
  <span class="ss">:ent-after</span> <span class="p">{</span><span class="ss">:db/id</span> <span class="mi">17592186045418</span>, 
              <span class="ss">:user/email</span> <span class="s">"august@augustl.com"</span>, 
              <span class="ss">:user/password</span> <span class="s">"hash-123-abc"</span><span class="p">}}</span>

<span class="c1">;; The second TX</span>
 <span class="p">{</span><span class="ss">:timestamp</span> <span class="o">#</span><span class="nv">inst</span><span class="s">"2019-06-11T13:54:12.693-00:00"</span>,
  <span class="ss">:ent-before</span> <span class="p">{</span><span class="ss">:db/id</span> <span class="mi">17592186045418</span>, 
               <span class="ss">:user/email</span> <span class="s">"august@augustl.com"</span>, 
               <span class="ss">:user/password</span> <span class="s">"hash-123-abc"</span><span class="p">}</span>,
  <span class="ss">:ent-after</span> <span class="p">{</span><span class="ss">:db/id</span> <span class="mi">17592186045418</span>,
              <span class="ss">:user/email</span> <span class="s">"august@augustl.com"</span>,
              <span class="ss">:user/password</span> <span class="s">"hash-123-abc"</span>,
              <span class="ss">:user/subscribed-to-newsletter?</span> <span class="nv">true</span><span class="p">}}</span>
<span class="c1">;; The third TX</span>
 <span class="p">{</span><span class="ss">:timestamp</span> <span class="o">#</span><span class="nv">inst</span><span class="s">"2019-06-11T13:54:22.530-00:00"</span>,
  <span class="ss">:ent-before</span> <span class="p">{</span><span class="ss">:db/id</span> <span class="mi">17592186045418</span>,
               <span class="ss">:user/email</span> <span class="s">"august@augustl.com"</span>,
               <span class="ss">:user/password</span> <span class="s">"hash-123-abc"</span>,
               <span class="ss">:user/subscribed-to-newsletter?</span> <span class="nv">true</span><span class="p">}</span>,
  <span class="ss">:ent-after</span> <span class="p">{</span><span class="ss">:db/id</span> <span class="mi">17592186045418</span>,
              <span class="ss">:user/email</span> <span class="s">"august@kodemaker.no"</span>,
              <span class="ss">:user/password</span> <span class="s">"hash-123-abc"</span>,
              <span class="ss">:user/subscribed-to-newsletter?</span> <span class="nv">true</span><span class="p">}}</span>
<span class="p">)</span></code></pre>

There are a couple of intersting to note here.

Note how we get what seems like a full entity with an id from `:ent-before` in the first tx. This is because the Datomic `(d/entity)` API does not actually check whether any facts exists for an entity before generating an `EntityMap` data structure.

The essential data structure here is just a sorted list of TX ids. We can safely sort on transaction ID, since the transaction is a monotone sequence.

We also use a special trick. We have a list of transactions, but how do we get the entity as of right before that transaction? We use `(d/tx->t)` to get the "T" value of the tx, i.e. its internal monotone sequence number that we can pass to "as-of". If we decrement that number, we'll get the transaction before tx. This is guaranteed by Datomic.

This is a slighly more practical version of the "real" way, which would be to map over pairs of transaction A+B, B+C, C+D etc.

## Generate a list of entities with the timestamp, and a list of attributes that changed, and to which value

This is pretty simple when we have our existing query over the history db.

To make things slightly more interesting, let's add a fourth transaction, that doesn't update anything, but just deletes an attribute. Let's assume that the password expired or something like that, so we retract the hash from the database.

<pre><code class="highlight"><span class="c1">;; Add some more data - retract (delete/remove/wipe) an attribute</span>

<span class="c1">;; tx 4</span>
<span class="p">[[</span><span class="ss">:db/retract</span> <span class="mi">1</span> <span class="ss">:user/password</span> <span class="s">"hash-123-abc"</span><span class="p">]]</span>

<span class="c1">;; Pull out reference to latest db</span>
<span class="p">(</span><span class="k">def </span><span class="nv">my-db</span> <span class="p">(</span><span class="nf">d/db</span> <span class="nv">my-conn</span><span class="p">))</span></code></pre>


Note that if we didn't re-assign my-db, we'd still get the old view without transaction 4, even though we use the history db. The history db is still an immutable reference to a point in time, it's just that it contains all of the history up until that point, not just the data directly visible in the index in the normal db view.

Now, let's generate the data we need.

<pre><code class="highlight"><span class="c1">;; Complete diff of changes made over time to an entity</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nf">d/q</span>
       <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?tx</span> <span class="nv">?attr</span> <span class="nv">?val</span> <span class="nv">?added</span>
         <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?e</span>
         <span class="ss">:where</span>
         <span class="p">[</span><span class="nv">?e</span> <span class="nv">?attr</span> <span class="nv">?val</span> <span class="nv">?tx</span> <span class="nv">?added</span><span class="p">]]</span>
       <span class="p">(</span><span class="nf">d/history</span> <span class="nv">my-db</span><span class="p">)</span>
       <span class="nv">my-eid</span><span class="p">)</span>
     <span class="p">(</span><span class="nf">group-by</span> <span class="nv">first</span><span class="p">)</span>
     <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">tx</span> <span class="nv">v</span><span class="p">]]</span>
            <span class="p">[</span><span class="nv">tx</span>
             <span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="nv">v</span>
                  <span class="p">(</span><span class="nf">group-by</span> <span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">tx</span> <span class="nv">attr</span> <span class="nb">val </span><span class="nv">added</span><span class="p">]]</span> <span class="nv">attr</span><span class="p">))</span>
                  <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">attr</span> <span class="nv">changes</span><span class="p">]]</span>
                         <span class="p">[(</span><span class="nf">d/ident</span> <span class="nv">my-db</span> <span class="nv">attr</span><span class="p">)</span>
                          <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">tx</span> <span class="nv">attr</span> <span class="nb">val </span><span class="nv">added?</span><span class="p">]]</span> <span class="p">{</span><span class="ss">:val</span> <span class="nb">val </span><span class="ss">:added?</span> <span class="nv">added?</span><span class="p">})</span>
                               <span class="nv">changes</span><span class="p">)])))]))</span>
     <span class="p">(</span><span class="nb">sort-by </span><span class="p">(</span><span class="k">fn </span><span class="p">[[</span><span class="nv">tx</span> <span class="nv">v</span><span class="p">]]</span> <span class="nv">tx</span><span class="p">)))</span></code></pre>

When we look at the data, we can see that we have everything we need in order to generate a useful GUI.

<pre><code class="highlight"><span class="c1">;; =&gt; returns</span>
<span class="p">(</span>
 <span class="c1">;; tx 1</span>
 <span class="p">[</span><span class="mi">13194139534313</span> <span class="p">(</span>
   <span class="p">[</span><span class="ss">:user/password</span> <span class="p">({</span><span class="ss">:val</span> <span class="s">"hash-123-abc"</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">})]</span> 
   <span class="p">[</span><span class="ss">:user/email</span> <span class="p">({</span><span class="ss">:val</span> <span class="s">"august@augustl.com"</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">})])]</span>
  
 <span class="c1">;; tx 2</span>
 <span class="p">[</span><span class="mi">13194139534317</span> <span class="p">(</span>
   <span class="p">[</span><span class="ss">:user/subscribed-to-newsletter?</span> <span class="p">({</span><span class="ss">:val</span> <span class="nv">true</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">})])]</span>
 
 <span class="c1">;; tx 3</span>
 <span class="p">[</span><span class="mi">13194139534318</span> <span class="p">(</span>
   <span class="p">[</span><span class="ss">:user/email</span> <span class="p">({</span><span class="ss">:val</span> <span class="s">"august@kodemaker.no"</span>, <span class="ss">:added?</span> <span class="nv">true</span><span class="p">}</span>
                 <span class="p">{</span><span class="ss">:val</span> <span class="s">"august@augustl.com"</span>, <span class="ss">:added?</span> <span class="nv">false</span><span class="p">})])]</span>
  
 <span class="c1">;; tx 4</span>
 <span class="p">[</span><span class="mi">13194139534319</span> <span class="p">(</span>
   <span class="p">[</span><span class="ss">:user/email</span> <span class="p">({</span><span class="ss">:val</span> <span class="s">"august@kodemaker.no"</span>, <span class="ss">:added?</span> <span class="nv">false</span><span class="p">})])])</span></code></pre>

## Look at all the things I'm not doing

If you don't use Datomic, you can always implement this yourself. And figure out all the wrong ways to do it before you end up with something useful (and performant).

But what if you get this requirement when your app is already up and running in production?

Well, a buddy of mine has done just that. They did _not_ have an audit log requirement up front. But since this is not an up-front decision you have to make, you can be completely oblivious to this, and just add it later, in the forms of queries.

Check it out! It starts around 24:00.

<iframe src="https://player.vimeo.com/video/234054197?color=ff9933&portrait=0" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
