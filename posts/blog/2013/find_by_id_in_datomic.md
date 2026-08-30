---
title: "Finding by ID (primary key) in Datomic"
date: "2013-03-10"
content_format: "html"
archive_order: 49
series: "datomic"
---
<p>Datomic has no essential type for entities, so how do you <strong>find the user with id X</strong> with Datomic?</p>

<h2>Finding by internal Datomic entity ID</h2>

<p>All entities in datomic gets the attribute <code class="highlight">:db/id</code>, which is Datomic's own primary key attribute. You might be surprised that <code class="highlight">(d/entity db 123)</code> for an entity id that doesn't exists doesn't return nil.</p>

<pre><code class="highlight"><span class="p">(</span><span class="nf">require</span> <span class="p">[</span><span class="ss">'datomic.api</span> <span class="ss">:as</span> <span class="ss">'d</span><span class="p">])</span>

<span class="p">(</span><span class="k">def </span><span class="nv">db</span> <span class="p">(</span><span class="nf">d/db</span> <span class="nv">my-datomic-connection</span><span class="p">))</span>
<span class="p">(</span><span class="k">def </span><span class="nv">non-existing-id</span> <span class="mi">123123</span><span class="p">)</span>
<span class="p">(</span><span class="nf">d/entity</span> <span class="nv">db</span> <span class="nv">non-existing-id</span><span class="p">)</span>
<span class="c1">;; Returns an actual entity</span>
<span class="c1">;; Even if there's no entity with id 123123</span></code></pre>

<p>To actually find an entity by ID, you need to run a query.</p>

<pre><code class="highlight"><span class="c1">;; Assuming an entity with id 123 exists</span>

<span class="p">(</span><span class="nf">d/q</span> <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?eid</span> <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?eid</span> <span class="ss">:where</span> <span class="p">[</span><span class="nv">?eid</span><span class="p">]]</span> <span class="nv">db</span> <span class="mi">123</span><span class="p">)</span>
<span class="c1">;; HashSet [[123]]</span>

<span class="p">(</span><span class="nf">d/q</span> <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?eid</span> <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?eid</span> <span class="ss">:where</span> <span class="p">[</span><span class="nv">?eid</span><span class="p">]]</span> <span class="nv">db</span> <span class="nv">non-existing-id</span><span class="p">)</span>
<span class="c1">;; HashSet [[]]</span></code></pre>

<p>Also, just for fun, we can create a reproducible example that doesn't depend on having an actual Datomic database around, since Datomic is able to query any data strucutre that consists of a list of lists.</p>

<pre><code class="highlight"><span class="c1">;; This is what an actual Datomic DB actually looks like.</span>
<span class="p">(</span><span class="k">def </span><span class="nv">my-mock-db</span> <span class="p">[</span>
  <span class="p">[</span><span class="mi">123</span> <span class="ss">:name</span> <span class="s">"Test"</span><span class="p">]</span>
  <span class="p">[</span><span class="mi">123</span> <span class="ss">:email</span> <span class="s">"test@test.com"</span><span class="p">]</span>
  <span class="p">[</span><span class="mi">456</span> <span class="ss">:name</span> <span class="s">"Foo"</span><span class="p">]</span>
  <span class="p">[</span><span class="mi">456</span> <span class="ss">:email</span> <span class="s">"Hello"</span><span class="p">]])</span>

<span class="c1">;; A "normal" query, for good measure.</span>
<span class="p">(</span><span class="nf">d/q</span> <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?person</span>
       <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?name</span>
       <span class="ss">:where</span> <span class="p">[</span><span class="nv">?person</span> <span class="ss">:name</span> <span class="nv">?name</span><span class="p">]]</span>
     <span class="nv">my-mock-db</span> <span class="s">"Test"</span><span class="p">)</span>
<span class="c1">;; HashSet [[123]]</span>

<span class="p">(</span><span class="nf">d/q</span> <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?eid</span> <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?eid</span> <span class="ss">:where</span> <span class="p">[</span><span class="nv">?eid</span><span class="p">]]</span> <span class="nv">my-mock-db</span> <span class="mi">123</span><span class="p">)</span>
<span class="c1">;; HashSet [[123]]</span>

<span class="p">(</span><span class="nf">d/q</span> <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?eid</span> <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?eid</span> <span class="ss">:where</span> <span class="p">[</span><span class="nv">?eid</span><span class="p">]]</span> <span class="nv">my-mock-db</span> <span class="mi">999</span><span class="p">)</span>
<span class="c1">;; HashSet [[]]</span></code></pre>

<p>However, how do we know that we get an entity of the type we want? Datomic entities doesn't actually have a type, they're just entities with attributes, so we're at a loss.</p>

<h2>Using manual "public ID" attributes</h2>

<p>I like to have a public ID field per entity type in my system. Again, Datomic entities has no type, so this is all on us, Datomic doesn't care.</p>

<p>I use a string type that's set to unique. Setting it to unique is obviously important. You could also use the built-in UUID type if you want to, but I find it more convenient to just work with strings.</p>

<pre><code class="highlight"><span class="c1">;; Inserting data</span>
<span class="p">(</span><span class="nf">d/transact</span>
  <span class="nv">my-datomic-conn</span>
  <span class="p">[{</span><span class="ss">:person/name</span> <span class="s">"Test"</span>
    <span class="ss">:person/email</span> <span class="s">"test@test.com"</span>
    <span class="ss">:person/public-id</span> <span class="p">(</span><span class="nb">str </span><span class="p">(</span><span class="nf">java.util.UUID/randomUUID</span><span class="p">))</span>
    <span class="ss">:db/id</span> <span class="p">(</span><span class="nf">d/tempid</span> <span class="ss">:db.part/user</span><span class="p">}])</span>

<span class="c1">;; ...</span>

<span class="p">(</span><span class="nf">d/q</span>
 <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?person</span>
   <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?pub-id</span>
   <span class="ss">:where</span>
   <span class="p">[</span><span class="nv">?person</span> <span class="ss">:person/public-id</span> <span class="nv">?pub-id</span><span class="p">]]</span>
 <span class="nv">db</span>
 <span class="nv">person-id</span><span class="p">)</span></code></pre>

<p>Benefits:</p>

<ul>
  <li>You get an entity type system for free. If you use a Datomic ID, how do you query for people entities only for <tt>GET /people/123</tt>?</li>
  <li>Datomic entity IDs stay internal, meaning you don't have to worry about possible entity ID changes when you import/export the database.</li>
  <li>You don't have to convert from a string type to a numeric type when you get the entity ID from a URL. Not a very big deal, but since it's a very common use case I'd say it counts.</li>
</ul>
