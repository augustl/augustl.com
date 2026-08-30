---
title: "Recursively doing stuff with hashes"
date: "2008-08-31"
content_format: "html"
archive_order: 83
---
<p>It's assumed that by "recursive", one means that when a value in a hash contains another hash, do X on that hash as well.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Hash</span>
  <span class="k">def</span> <span class="nf">recursively</span><span class="p">(</span><span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
    <span class="n">each</span> <span class="p">{</span><span class="o">|</span><span class="n">k</span><span class="p">,</span> <span class="n">v</span><span class="o">|</span> <span class="no">Hash</span> <span class="o">===</span> <span class="n">v</span> <span class="p">?</span> <span class="n">v</span><span class="o">.</span><span class="n">recursively</span><span class="p">(</span><span class="o">&amp;</span><span class="n">block</span><span class="p">)</span> <span class="p">:</span> <span class="k">yield</span><span class="p">(</span><span class="n">k</span><span class="p">,</span> <span class="n">v</span><span class="p">)</span> <span class="p">}</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>This lets us do the following:</p>

<pre><code class="highlight"><span class="n">h</span> <span class="o">=</span> <span class="p">{</span><span class="ss">:foo</span> <span class="o">=&gt;</span> <span class="s2">"bar"</span><span class="p">,</span> <span class="ss">:baz</span> <span class="o">=&gt;</span> <span class="p">{</span><span class="ss">:srsly</span> <span class="o">=&gt;</span> <span class="s2">"ye"</span><span class="p">,</span> <span class="ss">:oh_hai</span> <span class="o">=&gt;</span> <span class="p">{</span><span class="ss">:works</span> <span class="o">=&gt;</span> <span class="s2">"indeed"</span><span class="p">}}}</span>
<span class="n">h</span><span class="o">.</span><span class="n">recursively</span> <span class="p">{</span><span class="o">|</span><span class="n">k</span><span class="p">,</span> <span class="n">v</span><span class="o">|</span> <span class="n">v</span><span class="o">.</span><span class="n">upcase!</span> <span class="p">}</span>
<span class="c1"># =&gt; {:foo=&gt;"BAR", :baz=&gt;{:oh_hai=&gt;{:works=&gt;"INDEED"}, :srsly=&gt;"YE"}}</span></code></pre>

<p><tt>SystemStackError: stack level too deep</tt> can be produced by having one of the keys refer to the hash in question, though, be careful.</p>

<pre><code class="highlight"><span class="n">h</span> <span class="o">=</span> <span class="p">{</span><span class="ss">:foo</span> <span class="o">=&gt;</span> <span class="s2">"bar"</span><span class="p">,</span> <span class="ss">:maz</span> <span class="o">=&gt;</span> <span class="p">{</span><span class="ss">:hai</span> <span class="o">=&gt;</span> <span class="s2">"to you"</span><span class="p">}}</span>
<span class="n">h</span><span class="o">[</span><span class="ss">:oops</span><span class="o">]</span> <span class="o">=</span> <span class="n">h</span>
<span class="c1"># =&gt; {:oops=&gt;{...}, :foo=&gt;"bar", :maz=&gt;{:hai=&gt;"to you"}}</span>

<span class="n">h</span><span class="o">.</span><span class="n">recursively</span> <span class="p">{</span><span class="o">|</span><span class="n">k</span><span class="p">,</span> <span class="n">v</span><span class="o">|</span> <span class="n">v</span><span class="o">.</span><span class="n">upcase!</span> <span class="p">}</span>
<span class="c1"># =&gt; SystemStackError: stack level too deep</span></code></pre>
