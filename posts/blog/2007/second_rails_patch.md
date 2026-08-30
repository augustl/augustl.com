---
title: "Second Rails patch"
date: "2007-12-14"
content_format: "html"
archive_order: 88
---
<p>Adding Giles Bowkett&#8217;s ideas to <tt class="inline_code"><span class="co">ActiveSupport</span></tt>.</p>
 
<p>Here ya go:</p>

<p><a href="http://dev.rubyonrails.org/ticket/10503">http://dev.rubyonrails.org/ticket/10503</a></p>

<p>It&#8217;s pretty simple.</p>

<pre><code class="highlight"><span class="p">{</span><span class="ss">:a</span> <span class="o">=&gt;</span> <span class="ss">:b</span><span class="p">}</span> <span class="o">+</span> <span class="p">{</span><span class="ss">:c</span> <span class="o">=&gt;</span> <span class="ss">:d</span><span class="p">}</span>
<span class="c1"># =&gt; {:a =&gt; :b, :c =&gt; :d}</span>

<span class="p">{</span><span class="ss">:a</span> <span class="o">=&gt;</span> <span class="ss">:b</span><span class="p">,</span> <span class="ss">:c</span> <span class="o">=&gt;</span> <span class="ss">:d</span><span class="p">}</span> <span class="o">-</span> <span class="p">{</span><span class="ss">:c</span> <span class="o">=&gt;</span> <span class="ss">:d</span><span class="p">}</span>
<span class="c1"># =&gt; {:a =&gt; :b}</span>

<span class="p">{</span><span class="ss">:a</span> <span class="o">=&gt;</span> <span class="ss">:b</span><span class="p">,</span> <span class="ss">:c</span> <span class="o">=&gt;</span> <span class="ss">:d</span><span class="p">}</span> <span class="o">-</span> <span class="p">{</span><span class="ss">:c</span> <span class="o">=&gt;</span> <span class="ss">:x</span><span class="p">}</span>
<span class="c1"># =&gt; {:a =&gt; :b, :c =&gt; :d}</span></code></pre>

<p>All credits to Giles Bowkett for coming up with this.</p>
