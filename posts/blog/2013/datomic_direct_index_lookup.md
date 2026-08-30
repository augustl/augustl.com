---
title: "Datomic: Direct index lookup"
date: "2013-07-17"
content_format: "html"
series: "datomic"
---
<p>A couple of years ago, I read about someone whose MySQL performance bottleneck was SQL parsing. Most of the queries were straightforward primary key lookups, so the author wrote code that called InnoDB (MySQL's storage engine) directly and removed the bottleneck. I thought this was really cool, and I feel like I've reached a small milestone today for doing the same thing myself, only in Datomic.</p>

<p>In our system, we have a querying API that lists <em>everything</em> if an empty query is passed. This means we need to ask datomic for potentially 1000s of entities, and also make it happen in a reasonable amount of time. In the future, we we'll probably be more clever and lazily load stuff, but I wanted to see if there was a quick fix, since lazy loading in the UI takes a lot of work to get right.</p>

<p>Here's the old code:</p>

<pre><code class="highlight"><span class="p">(</span><span class="nf">require</span> <span class="o">'</span><span class="p">[</span><span class="nv">datomic.api</span> <span class="ss">:as</span> <span class="nv">d</span><span class="p">])</span>

<span class="p">(</span><span class="nf">map</span>
  <span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">public-id</span><span class="p">]</span>
    <span class="p">(</span><span class="nf">d/entity</span>
      <span class="nv">db</span>
      <span class="p">(</span><span class="nf">ffirst</span>
        <span class="p">(</span><span class="nf">d/q</span>
          <span class="o">'</span><span class="p">[</span><span class="ss">:find</span> <span class="nv">?attendant</span>
            <span class="ss">:in</span> <span class="nv">$</span> <span class="nv">?pub-id</span>
            <span class="ss">:where</span>
            <span class="p">[</span><span class="nv">?attendant</span> <span class="ss">:attendant/public-id</span> <span class="nv">?pub-id</span><span class="p">]]</span>
          <span class="nv">db</span>
          <span class="nv">pub-id</span><span class="p">))))</span>
  <span class="nv">public-ids</span><span class="p">)</span></code></pre>

<p>The attribute <code class="highlight">:attendant/public-id</code> is a string attribute where we insert Datomic squuids. We only expose these IDs to the outside world, the Datomic entity IDs stay internal to Datomic.</p>

<p>In the extreme cases, 2600 such public IDs is what we mapped over, resulting in 2600 queries being performed. This took about <strong>1 second</strong>, and was not acceptable. The solution is to not query at all, but just look up the value in the Datomic index. This ended up taking about <strong>0.1 seconds</strong>, so a ten-fold performance increase. Not bad at all! Here's the updated code:</p>

<pre><code class="highlight"><span class="c1">;; Yields exactly the same output as the above query</span>
<span class="p">(</span><span class="nf">map</span>
  <span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">public-id</span><span class="p">]</span>
    <span class="p">(</span><span class="nf">d/entity</span> <span class="nv">db</span> <span class="p">(</span><span class="ss">:e</span> <span class="p">(</span><span class="nb">first </span><span class="p">(</span><span class="nf">d/datoms</span> <span class="nv">db</span> <span class="ss">:avet</span> <span class="ss">:attendant/public-id</span> <span class="nv">public-id</span><span class="p">)))))</span>
  <span class="nv">public-ids</span><span class="p">)</span></code></pre>

<p>Datomic has multiple indexes, and all of them are full copies of the data. So looking things up in an index is the only thing you need to do in order to access the data, and this is what the Datomic query engine does under the hood anyway, since all your data in the database is available to you as an immutable (and lazy) value.</p>

<p>The code to <code class="highlight"><span class="nv">d/datoms</span></code> flows as following:</p>

<ol>
  <li>Pass the datomic db whose indexes we want to look up.</li>
  <li>Pass the index to use. We want the <code class="highlight"><span class="ss">:avet</span></code> index. (Attribute, value, entity, transaction)
    <ul><li>The following arguments are the <em>components</em> to look up in the index.</li></ul>
  </li>
  <li>The first entry in <code class="highlight"><span class="ss">:avet</span></code> is <code class="highlight"><span class="ss">:a</span></code>. So we pass <code class="highlight"><span class="ss">:attendant/public-id</span></code>, the attribute we want to look up.</li>
  <li>The second entry in <code class="highlight"><span class="ss">:avet</span></code> is <code class="highlight"><span class="ss">:v</span></code>. So we pass <code class="highlight"><span class="nv">public-id</span></code>, the value we want to look up.</li>
</ol>

<p>This will give us a raw seq of facts. Since we know that the attribute <code class="highlight"><span class="ss">:attendant/public-id</span></code> is set to unique, we can just get the <code class="highlight"><span class="p">(</span><span class="nf">first</span><span class="p">)</span></code> one.</p>

<p>Aside: We could also just have passed one component, the attribute, and gotten back a sequence of facts for all facts for that attribute.</p>

<p>When we have our fact, we extract the entity ID from it. The fact is map-like, so all we need to do is <code class="highlight"><span class="p">(</span><span class="ss">:e</span> <span class="nv">fact</span><span class="p">)</span></code>.</p>

<p>Then we proceed as normal, and look up the full aggregated entity just as we do with the entity IDs we get from Datomic query results.</p>

<p>So there you go! Again, we should probably be more clever and lazy load stuff, but we just wanted a quick fix, and a ten-fold performance increase is more than good enough for now.</p>
