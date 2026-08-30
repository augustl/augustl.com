---
title: "<code>rescue nil</code> is not awesome"
date: "2008-09-11"
content_format: "html"
---
<p>Deliberately calling code that may raise an error is ugly. Just look at it:</p>

<pre><code class="highlight"><span class="n">person</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">gsub</span><span class="p">(</span><span class="sr">/foo/</span><span class="p">,</span> <span class="s1">'bar'</span><span class="p">)</span> <span class="k">rescue</span> <span class="kp">nil</span></code></pre>

<p>As <code class="highlight">person.name</code> returns <code class="highlight">nil</code> if no name has been set, <code class="highlight">person.name.gsub</code> would raise a <code class="highlight">NoMethodError</code> in the event of a nameless person. <code class="highlight">nil</code> has no <code class="highlight">gsub</code> method. Because we know this, we <code class="highlight">rescue</code>. So, we deliberately call code that may raise an error. Which is ugly.</p>

<p>Instead, you should determine wether or not the code you call can raise an error, and then just not call it.</p>

<pre><code class="highlight"><span class="n">person</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">gsub</span><span class="p">(</span><span class="sr">/foo/</span><span class="p">,</span> <span class="s1">'bar'</span><span class="p">)</span> <span class="k">if</span> <span class="n">person</span><span class="o">.</span><span class="n">name</span></code></pre>

<p>This is also sort of odd, though. If getting a persons name takes 2 seconds, the additional call to <code class="highlight">person.name</code> sucks. Etc.</p>

<p>Introducing <soruce>try</soruce>!</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Object</span>
  <span class="k">def</span> <span class="nf">try</span><span class="p">(</span><span class="o">*</span><span class="n">args</span><span class="p">,</span> <span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
    <span class="k">return</span> <span class="k">if</span> <span class="nb">self</span><span class="o">.</span><span class="n">nil?</span>
    <span class="nb">block_given?</span> <span class="p">?</span> <span class="k">yield</span><span class="p">(</span><span class="nb">self</span><span class="p">)</span> <span class="p">:</span> <span class="nb">self</span><span class="o">.</span><span class="n">__send__</span><span class="p">(</span><span class="n">args</span><span class="o">.</span><span class="n">shift</span><span class="p">,</span> <span class="o">*</span><span class="n">args</span><span class="p">)</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Yes! Now you can do this instead:</p>

<pre><code class="highlight"><span class="n">person</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">try</span><span class="p">(</span><span class="ss">:gsub</span><span class="p">,</span> <span class="sr">/foo/</span><span class="p">,</span> <span class="s1">'bar'</span><span class="p">)</span></code></pre>

<p>An actual working sample:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Person</span>
  <span class="kp">attr_reader</span> <span class="ss">:name</span>

  <span class="k">def</span> <span class="nf">initialize</span><span class="p">(</span><span class="nb">name</span> <span class="o">=</span> <span class="kp">nil</span><span class="p">)</span>
    <span class="vi">@name</span> <span class="o">=</span> <span class="nb">name</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="nb">p</span> <span class="o">=</span> <span class="no">Person</span><span class="o">.</span><span class="n">new</span><span class="p">()</span> <span class="c1"># name is nil!</span>
<span class="nb">p</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">upcase</span>
<span class="c1"># =&gt; NoMethodError: undefined method ‘upcase’ for nil:NilClass</span>

<span class="nb">p</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">try</span><span class="p">(</span><span class="ss">:upcase</span><span class="p">)</span>
<span class="c1"># =&gt; nil</span>

<span class="nb">p</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">try</span><span class="p">(</span><span class="ss">:gsub</span><span class="p">,</span> <span class="sr">/foo/</span><span class="p">,</span> <span class="s1">'bar'</span><span class="p">)</span>
<span class="c1"># =&gt; nil</span>

<span class="nb">p</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">try</span> <span class="p">{</span><span class="o">|</span><span class="n">n</span><span class="o">|</span> <span class="n">n</span><span class="o">.</span><span class="n">upcase</span><span class="o">.</span><span class="n">reverse</span> <span class="p">}</span>
<span class="c1"># =&gt; nil</span></code></pre>

<p>Every call returns nil, because <code class="highlight">name</code> is nil. The point is that no errors were raised.</p>

<p>Here's how it looks when <code class="highlight">name</code> isn't nil:</p>

<pre><code class="highlight"><span class="n">p2</span> <span class="o">=</span> <span class="no">Person</span><span class="o">.</span><span class="n">new</span><span class="p">(</span><span class="s1">'Joe'</span><span class="p">)</span>

<span class="n">p2</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">try</span><span class="p">(</span><span class="ss">:upcase</span><span class="p">)</span>
<span class="c1"># =&gt; "JOE"</span>

<span class="n">p2</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">try</span><span class="p">(</span><span class="ss">:gsub</span><span class="p">,</span> <span class="sr">/J/</span><span class="p">,</span> <span class="s1">'A'</span><span class="p">)</span>
<span class="c1"># =&gt; 'Aoe'</span>

<span class="n">p2</span><span class="o">.</span><span class="n">name</span><span class="o">.</span><span class="n">try</span> <span class="p">{</span><span class="o">|</span><span class="n">n</span><span class="o">|</span> <span class="n">n</span><span class="o">.</span><span class="n">upcase</span><span class="o">.</span><span class="n">reverse</span> <span class="p">}</span>
<span class="c1"># =&gt; "EOJ"</span></code></pre>
