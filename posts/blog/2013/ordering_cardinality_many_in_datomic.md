---
title: "Ordering of <code>:db.cardinality/many</code> attributes in Datomic"
date: "2013-05-04"
content_format: "html"
archive_order: 46
series: "datomic"
---
<p>In this post, I assume you already know about Datomic, how to use it, and the difference of the two settings for <code class="highlight">:db/cardinality</code> on an attribute.</p>

<h2>Tree structures and ordering</h2>

<p><code class="highlight">:db/cardinality.many</code> values are sets. One of the big differences between Datomic and in a typical RDBMS, is that Datomic uses tree structures for pretty much everything. In a RDBMS you typically get insertion order when querying without specifying what to sort on, but Datomic can't do that since a tree structure isn't ordered in the same way. </p>

<p>Your business logic might require ordering, though, so to achieve this you need to add a <code class="highlight">:position</code> attribute to your entities. So the question becomes: how to we consistently and safely manage this <code class="highlight">:position</code> attribute in a way that ensures we don't get inconsistent values in a multi-peer world?</p>

<h2>Transaction functions to the rescue</h2>

<p>In any situation where multi-peer consistensy is required, a <a href="http://docs.datomic.com/database-functions.html">transaction function</a> is the solution. Most of the developers I've spoken to that aren't familiar with Datomic despises the idea of storing and executing code on the database server. But since I'm in Clojure land in my system, and the transactor is too, it doesn't really feel as foreign as PLSQL might do, and since Datomic is free of time complexities, maintaining and synchronizing changes in the transaction functions is pretty much hassle free.</p>

<p>Here's an example of a transaction entry that adds a transaction function for ordering to the transactor.</p>

<pre><code class="highlight"><span class="p">{</span><span class="ss">:db/id</span> <span class="o">#</span><span class="nv">db/id</span><span class="p">[</span><span class="ss">:db.part/user</span><span class="p">]</span>
  <span class="ss">:db/ident</span> <span class="ss">:append-position-in-scope</span>
  <span class="ss">:db/doc</span> <span class="s">"Atomically adds to the end of a list of sorted cardinality/many lists"</span>
  <span class="ss">:db/fn</span> <span class="o">#</span><span class="nv">db/fn</span> <span class="p">{</span><span class="ss">:lang</span> <span class="s">"clojure"</span>
                 <span class="ss">:params</span> <span class="p">[</span><span class="nv">db</span> <span class="nv">scope-id</span> <span class="nv">scope-attr</span> <span class="nv">new-id</span> <span class="nv">pos-attr</span><span class="p">]</span>
                 <span class="ss">:code</span> <span class="p">(</span><span class="k">let </span><span class="p">[</span><span class="nb">children </span><span class="p">(</span><span class="nf">scope-attr</span> <span class="p">(</span><span class="nf">datomic.api/entity</span> <span class="nv">db</span> <span class="nv">scope-id</span><span class="p">))</span>
                             <span class="nv">highest-pos</span> <span class="p">(</span><span class="nb">reduce max </span><span class="mi">0</span> <span class="p">(</span><span class="nb">map </span><span class="nv">pos-attr</span> <span class="nv">children</span><span class="p">))]</span>
                         <span class="p">[[</span><span class="ss">:db/add</span> <span class="nv">new-id</span> <span class="nv">pos-attr</span> <span class="p">(</span><span class="nb">inc </span><span class="nv">highest-pos</span><span class="p">)]])}}</span></code></pre>

<p>The entities at work here is a &quot;todo list&quot; that has a <code class="highlight">:db/cardinality.many</code> attribute called <code class="highlight">:todolist/items</code>.</p>

<p><code class="highlight">children</code> essentially translates to <code class="highlight">(:todolist/items todolist-entity)</code>, and then we calculate the highest <code class="highlight">:position</code>, <code class="highlight">pos-attr</code>, currently in the list and increments that by one.</p>

<p>On the peer side, we can now create a transaction for adding a new todo item and setting its position to be at the end of the list.</p>

<pre><code class="highlight"><span class="p">[{</span><span class="ss">:todoitem/text</span> <span class="s">"This needs to be done"</span>
 <span class="ss">:db/id</span> <span class="nv">new-todo-item-tempid</span><span class="p">}</span>
 <span class="p">[</span><span class="ss">:append-position-in-scope</span> <span class="nv">todolist-eid</span> <span class="ss">:todolist/items</span> <span class="nv">new-todo-item-tempid</span> <span class="ss">:position</span><span class="p">]]</span></code></pre>

<p>Since the Datomic transactor ensures consistency, the transaction function is guaranteed to expand to a <code class="highlight">:position</code> value of the currently highest position in the list plus one. There's absolutely no risk of race conditions here.</p>

<h2>Filling gaps</h2>

<p>The other function I have for working with sorted sets is a function that I use when I delete an individual item, to fill in the gaps.</p>

<pre><code class="highlight"><span class="p">{</span><span class="ss">:db/id</span> <span class="o">#</span><span class="nv">db/id</span><span class="p">[</span><span class="ss">:db.part/user</span><span class="p">]</span>
  <span class="ss">:db/ident</span> <span class="ss">:reset-position-in-scope</span>
  <span class="ss">:db/doc</span> <span class="s">"Goes through existing positions and sequentializes them"</span>
  <span class="ss">:db/fn</span> <span class="o">#</span><span class="nv">db/fn</span> <span class="p">{</span><span class="ss">:lang</span> <span class="s">"clojure"</span>
                 <span class="ss">:params</span> <span class="p">[</span><span class="nv">db</span> <span class="nv">scope-id</span> <span class="nv">scope-attr</span> <span class="nv">retracted-eid</span> <span class="nv">sorted-attr</span><span class="p">]</span>
                 <span class="ss">:code</span> <span class="p">(</span><span class="k">let </span><span class="p">[</span><span class="nb">children </span><span class="p">(</span><span class="nf">scope-attr</span> <span class="p">(</span><span class="nf">datomic.api/entity</span> <span class="nv">db</span> <span class="nv">scope-id</span><span class="p">))</span>
                             <span class="nv">sorted-children</span> <span class="p">(</span><span class="nb">sort-by </span><span class="nv">sorted-attr</span> <span class="nv">children</span><span class="p">)</span>
                             <span class="nv">without-retracted</span> <span class="p">(</span><span class="nb">filter </span><span class="o">#</span><span class="p">(</span><span class="nb">not= </span><span class="p">(</span><span class="ss">:db/id</span> <span class="nv">%</span><span class="p">)</span> <span class="nv">retracted-eid</span><span class="p">)</span>
                                                       <span class="nv">sorted-children</span><span class="p">)]</span>
                         <span class="p">(</span><span class="nf">map-indexed</span>
                          <span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">idx</span> <span class="nv">entity</span><span class="p">]</span>
                           <span class="p">[</span><span class="ss">:db/add</span> <span class="nv">scope-id</span> <span class="nv">sorted-attr</span> <span class="nv">idx</span><span class="p">])))}}</span></code></pre>

<p>When a positioned entity is deleted, it would normally leave a gap in the position attribute. This function goes through all of what's left and sets the positions to 0 and up, with zero gaps. Note that this creates facts for _all_ the remaining entities. It could probably be improved to only state facts for the items from retracted-eid and below.</p>

<p>Since this is always used when an entity is retracted, we need to pass in the entity that is being retracted as well, so we can remove it from the set. The transaction gets the database as of before the transaction commits, so even if we have a retract entity command in the transaction, this function won't know. So we manually remove that from the list.</p>
