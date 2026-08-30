---
title: "Just a little Rubinius trick"
date: "2008-09-03"
content_format: "html"
archive_order: 80
---
<p>Rubinius can do it all.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">pwn_locals</span>
  <span class="no">MethodContext</span><span class="o">.</span><span class="n">current</span><span class="o">.</span><span class="n">sender</span><span class="o">.</span><span class="n">locals</span><span class="o">[</span><span class="mi">0</span><span class="o">]</span> <span class="o">=</span> <span class="mi">666</span>
<span class="k">end</span>

<span class="n">a</span> <span class="o">=</span> <span class="mi">8</span>
<span class="n">pwn_locals</span>
<span class="nb">puts</span> <span class="n">a</span>
<span class="c1"># =&gt; 666</span></code></pre>

<p>Isn't that just awesome?</p>
