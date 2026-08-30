---
title: "Extending Ruby classes in a Rails app"
date: "2007-12-06"
content_format: "html"
archive_order: 91
---
<p>Extending a Ruby class (or any class, really) in a Rails app is easy mode. Here&#8217;s how to do it.</p>

<p>Say we&#8217;re extending array. Add a file called <tt>array_extension.rb</tt> to <tt>lib/</tt>. In other words, <tt>lib/array_extension.rb</tt>. Put this inside that file:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Array</span>
  <span class="k">def</span> <span class="nf">be_silly</span>
    <span class="nb">self</span><span class="o">.</span><span class="n">reverse</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span><span class="o">|</span><span class="n">i</span><span class="o">|</span> <span class="n">i</span><span class="o">.</span><span class="n">upcase</span> <span class="p">}</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Yay, we added a <tt class="inline_code">be_silly</tt> method. Here&#8217;s how it works:</p> 
 
<pre><code class="highlight"><span class="o">[</span><span class="s2">"this"</span><span class="p">,</span> <span class="s2">"is"</span><span class="p">,</span> <span class="s2">"cool"</span><span class="o">].</span><span class="n">be_silly</span>
<span class="c1"># =&gt; ["COOL", "IS", "THIS"]</span></code></pre>

<p>However, one more thing needs to be done. Open <tt>config/environment.rb</tt> and add this to the very bottom of the file:</p>

<pre><code class="highlight"><span class="nb">require</span> <span class="s2">"array_extension"</span></code></pre>
 
<p>Voila!</p>
