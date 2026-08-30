---
title: "First Rails patch"
date: "2007-11-21"
content_format: "html"
---
<p>Made a rails patch that improves the behavior of some form helper methods. I&#8217;m proud!</p> 
 
<p>The syntax of the select helpers is annoying! It is</p>

<pre><code class="highlight"><span class="n">collection_select</span><span class="p">(</span><span class="ss">:category_id</span><span class="p">,</span> <span class="vi">@categories</span><span class="p">,</span> <span class="s1">'id'</span><span class="p">,</span> <span class="s1">'title'</span><span class="p">,</span> <span class="p">{},</span> <span class="ss">:class</span> <span class="o">=&gt;</span> <span class="s2">"cool"</span><span class="p">)</span></code></pre>
 
<p>Two option hashes! Noone likes that, <a href="http://groups.google.com/group/rubyonrails-core/browse_thread/thread/976230070a08978a">not even Jeremy Kemper</a> (first follow-up). I made my first evah patch, and submitted it!</p>

<p><a href="http://dev.rubyonrails.org/ticket/10233">http://dev.rubyonrails.org/ticket/10233</a></p> 
<p>It lets you:</p>

<pre><code class="highlight"><span class="n">collection_select</span><span class="p">(</span><span class="ss">:category_id</span><span class="p">,</span> <span class="vi">@categories</span><span class="p">,</span> <span class="s1">'id'</span><span class="p">,</span> <span class="s1">'title'</span><span class="p">,</span> <span class="ss">:html</span> <span class="o">=&gt;</span> <span class="p">{</span><span class="ss">:class</span> <span class="o">=&gt;</span> <span class="s2">"cool"</span><span class="p">})</span></code></pre>

<p>Just like <code class="highlight">form_for</code>. And it avoids <code class="highlight">with_options</code> getting screwed up, too.</p>
 
<p>It&#8217;s even backwards compatible, thanks to some haxx <tt class="inline_code">*args</tt>-parsing.</p>
