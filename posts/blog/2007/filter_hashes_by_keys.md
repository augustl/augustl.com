---
title: "Filter hashes by keys"
date: "2007-11-22"
content_format: "html"
---
<p>Hash + enumerable = annoying, but negative rejects lets you achieve this filtering thingie.</p> 

<p>I find the enumerable stuff in hash annoying. Hash#select returns arrays and stuff, I hate it.</p>
 
<p>I needed to filter a hash by keys.</p> 
 
<pre><code class="highlight"><span class="n">h</span> <span class="o">=</span> <span class="p">{</span><span class="ss">:hai</span> <span class="o">=&gt;</span> <span class="s2">"lolz"</span><span class="p">,</span> <span class="ss">:burz</span> <span class="o">=&gt;</span> <span class="s2">"barz"</span><span class="p">,</span> <span class="ss">:maz</span> <span class="o">=&gt;</span> <span class="s2">"garfer"</span><span class="p">}</span>
<span class="nb">puts</span> <span class="n">h</span><span class="o">.</span><span class="n">filter</span><span class="p">(</span><span class="ss">:hai</span><span class="p">,</span> <span class="ss">:burz</span><span class="p">)</span>
<span class="c1"># =&gt; {:hai=&gt;"lolz", :burz=&gt;"barz"}</span></code></pre>
 
<p><code class="highlight">.reject</code> was the only enumerable thingie I found that returned a hash and isn&#8217;t destructive (such as <code class="highlight">delete_all</code>), so this is what I ended up doing:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Hash</span>
  <span class="k">def</span> <span class="nf">filter</span><span class="p">(</span><span class="o">*</span><span class="n">args</span><span class="p">)</span>
    <span class="n">reject</span> <span class="p">{</span><span class="o">|</span><span class="n">k</span><span class="p">,</span> <span class="n">v</span><span class="o">|</span> <span class="o">!</span><span class="n">args</span><span class="o">.</span><span class="n">include?</span><span class="p">(</span><span class="n">k</span><span class="p">)</span> <span class="p">}</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Works well.</p>
