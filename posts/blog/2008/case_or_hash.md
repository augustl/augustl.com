---
title: "Case or hash"
date: "2008-09-26"
content_format: "html"
archive_order: 74
---
<p>A case statement:</p>

<pre><code class="highlight"><span class="n">redirect_to</span> <span class="k">case</span> <span class="n">request</span><span class="o">.</span><span class="n">domain</span>
<span class="k">when</span> <span class="s2">"foo.com"</span>
  <span class="n">some_path</span>
<span class="k">when</span> <span class="s2">"bar.com"</span>
  <span class="n">other_path</span>
<span class="k">else</span>
  <span class="n">default_path</span>
<span class="k">end</span></code></pre>

<p>Here, every case does the same thing. It gives redirect_to an argument. I think that you should use a hash instead.</p>

<pre><code class="highlight"><span class="no">DOMAIN_MAPPINGS</span> <span class="o">=</span> <span class="p">{</span>
  <span class="s2">"foo.com"</span> <span class="o">=&gt;</span> <span class="n">some_path</span><span class="p">,</span> <span class="s2">"bar.com"</span> <span class="o">=&gt;</span> <span class="n">other_path</span>
<span class="p">}</span>

<span class="n">redirect_to</span> <span class="no">DOMAIN_MAPPINGS</span><span class="o">[</span><span class="n">request</span><span class="o">.</span><span class="n">domain</span><span class="o">]</span> <span class="o">||</span> <span class="n">default_path</span></code></pre>

<p>As hashes and case statements are sort of similar, I prefer to make a clear distinction between them. I only use case statements when I'm doing different things on each case. Such as this:</p>

<pre><code class="highlight"><span class="k">case</span> <span class="n">current_user</span><span class="o">.</span><span class="n">role?</span>
<span class="k">when</span> <span class="ss">:admin</span>
  <span class="n">send_email</span>
<span class="k">when</span> <span class="ss">:editor</span>
  <span class="n">add_to_messages</span>
<span class="k">else</span>
  <span class="n">restrict_access!</span>
<span class="k">end</span></code></pre>
