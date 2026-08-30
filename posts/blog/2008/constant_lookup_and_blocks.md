---
title: "Constant lookup and blocks"
date: "2008-08-19"
content_format: "html"
---
<pre><code class="highlight"><span class="k">class</span> <span class="nc">HelperHandler</span>
  <span class="k">def</span> <span class="nf">foo_exists</span>
    <span class="no">Foo</span><span class="o">.</span><span class="n">exists</span>
  <span class="k">end</span>
  
  <span class="k">module</span> <span class="nn">Foo</span>
    <span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">exists</span>
      <span class="nb">puts</span> <span class="s2">"Foo does indeed exist"</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span>


<span class="n">h</span> <span class="o">=</span> <span class="no">HelperHandler</span><span class="o">.</span><span class="n">new</span>
<span class="n">h</span><span class="o">.</span><span class="n">foo_exists</span>
<span class="c1"># =&gt; "Foo does indeed exist"</span></code></pre>

<p>No surprises here. This, however, is quite surprising:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">HelperHandler</span>
  <span class="k">def</span> <span class="nf">initialize</span><span class="p">(</span><span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
    <span class="nb">instance_eval</span><span class="p">(</span><span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="no">HelperHandler</span><span class="o">.</span><span class="n">new</span> <span class="k">do</span>
  <span class="n">foo_exists</span>
  <span class="c1"># =&gt; "Foo does indeed exist"</span>
  <span class="no">Foo</span><span class="o">.</span><span class="n">exists</span>
  <span class="c1"># =&gt; NameError: uninitialized constant Foo</span>
<span class="k">end</span></code></pre>

<p>Doing <code class="highlight">instance_eval</code> is quite common in Ruby libraries. Sinatra, for example, which is what this website is built on, uses it. It evals the block in the context of the instance in question.</p>

<p>Calling the method worked, but referring to the <code class="highlight">Foo</code> constant is not OK.</p>

<p>That's because Ruby doesn't care about <code class="highlight">instance_eval</code> when it comes to constants. Constants are looked up in the calling scope. Nothing you can do about it.</p>

<p>Unless you want to be evil and use strings.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">HelperHandler</span>
  <span class="k">def</span> <span class="nf">initialize</span><span class="p">(</span><span class="n">evil</span><span class="p">)</span>
    <span class="nb">eval</span><span class="p">(</span><span class="n">evil</span><span class="p">)</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="no">HelperHandler</span><span class="o">.</span><span class="n">new</span> <span class="s2">"Foo.exists"</span>
<span class="c1"># =&gt; Foo does indeed exist</span></code></pre>
