---
title: "Active Record anywhere!"
date: "2008-08-31"
content_format: "html"
---
<p>You can use <code class="highlight">ActiveRecord</code> anywhere!</p>

<pre><code class="highlight"><span class="nb">require</span> <span class="s1">'rubygems'</span>
<span class="nb">require</span> <span class="s1">'active_record'</span>
 
<span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span><span class="o">.</span><span class="n">establish_connection</span><span class="p">({</span>
  <span class="ss">:adapter</span> <span class="o">=&gt;</span> <span class="s1">'postgresql'</span><span class="p">,</span>
  <span class="ss">:user</span> <span class="o">=&gt;</span> <span class="s1">'foo'</span><span class="p">,</span>
  <span class="ss">:password</span> <span class="o">=&gt;</span> <span class="s1">'bar'</span><span class="p">,</span>
  <span class="ss">:database</span> <span class="o">=&gt;</span> <span class="s1">'whatever'</span>
<span class="p">})</span>
 
<span class="k">class</span> <span class="nc">Task</span> <span class="o">&gt;&lt;</span> <span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="n">set_table_tame</span> <span class="s2">"a_legacy_thingie"</span>
  
  <span class="k">def</span> <span class="nf">utility_methods</span>
    <span class="n">update_attribute</span><span class="p">(</span><span class="ss">:title</span><span class="p">,</span> <span class="s2">"yep"</span><span class="p">)</span>
  <span class="k">end</span>
<span class="k">end</span>
 
<span class="no">Task</span><span class="o">.</span><span class="n">find</span><span class="p">(</span><span class="ss">:first</span><span class="p">)</span></code></pre>

<p>Etcetera. It&#8217;s <code class="highlight">ActiveRecord</code>, you know what to do. Going wild:</p>

<pre><code class="highlight"><span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span><span class="o">.</span><span class="n">establish_connection</span><span class="p">(</span><span class="ss">:adapter</span> <span class="o">=&gt;</span> <span class="s2">"sqlite3"</span><span class="p">,</span> <span class="ss">:database</span> <span class="o">=&gt;</span> <span class="s2">":memory:"</span><span class="p">)</span>
 
<span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Schema</span><span class="o">.</span><span class="n">define</span> <span class="k">do</span>
  <span class="n">create_table</span> <span class="ss">:posts</span> <span class="k">do</span> <span class="o">|</span><span class="n">t</span><span class="o">|</span>
    <span class="n">t</span><span class="o">.</span><span class="n">string</span> <span class="ss">:title</span>
    <span class="n">t</span><span class="o">.</span><span class="n">text</span> <span class="ss">:excerpt</span><span class="p">,</span> <span class="ss">:body</span>
  <span class="k">end</span>
<span class="k">end</span>
 
<span class="k">class</span> <span class="nc">Post</span> <span class="o">&lt;</span> <span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="n">validates_presence_of</span> <span class="ss">:title</span>
<span class="k">end</span>
 
<span class="no">Post</span><span class="o">.</span><span class="n">create</span><span class="p">(</span><span class="ss">:title</span> <span class="o">=&gt;</span> <span class="s2">"A new post!"</span><span class="p">)</span>
<span class="no">Post</span><span class="o">.</span><span class="n">create</span><span class="p">(</span><span class="ss">:title</span> <span class="o">=&gt;</span> <span class="s2">"Another post"</span><span class="p">,</span> <span class="ss">:excerpt</span> <span class="o">=&gt;</span> <span class="s2">"The excerpt is an excerpt."</span><span class="p">)</span>
 
<span class="nb">puts</span> <span class="no">Post</span><span class="o">.</span><span class="n">count</span>
<span class="c1"># =&gt;; 2</span></code></pre>
