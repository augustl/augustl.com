---
title: "before_filter-like stuff in Ruby"
date: "2007-11-30"
content_format: "html"
---
<p>Doin&#8217; some phat Ruby to add Rails&#8217; <code class="highlight">before_filter</code>-like behavior in Ruby (outside of Rails)</p> 

<p>If you ever wanted Rails&#8217; neat <code class="highlight">before_filter</code> kind of stuff outside of Rails, here&#8217;s how do to just that.</p> 
 
<p>We&#8217;re creating a proxy class, that uses <code class="highlight">method_missing</code> to do some magic. Whenever we call a method on this proxy class, the before filter stuff is called, and then the actual method we call. This proxy class also has all methods removed from it (such as <code class="highlight">inspect</code>, <code class="highlight">new</code>, <code class="highlight">methods</code> and so on.</p> 
 
 
<p>The actual method that we&#8217;re calling, however, is called on another class. This is done so that we can indeed do the filters on internal methods like <code class="highlight">send</code> etc, as mentioned above.</p> 

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Cool</span>
  <span class="k">def</span> <span class="nf">be_cool</span>
    <span class="nb">puts</span> <span class="s2">"I'm so damn cool tbh"</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="k">class</span> <span class="nc">Silly</span>
  <span class="nb">instance_methods</span><span class="o">.</span><span class="n">each</span> <span class="k">do</span> <span class="o">|</span><span class="n">meth</span><span class="o">|</span> 
    <span class="n">undef_method</span><span class="p">(</span><span class="n">meth</span><span class="p">)</span> <span class="k">unless</span> <span class="n">meth</span> <span class="o">=~</span> <span class="sr">/\A__/</span>
  <span class="k">end</span>

  <span class="k">def</span> <span class="nf">initialize</span>
    <span class="vi">@delegate</span> <span class="o">=</span> <span class="no">Cool</span><span class="o">.</span><span class="n">new</span>
    <span class="vi">@plz_do</span> <span class="o">=</span> <span class="o">[]</span>
  <span class="k">end</span>

  <span class="k">def</span> <span class="nf">method_missing</span><span class="p">(</span><span class="n">meth</span><span class="p">,</span> <span class="o">*</span><span class="n">args</span><span class="p">,</span> <span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
    <span class="vi">@plz_do</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span><span class="o">|</span><span class="n">action</span><span class="o">|</span> <span class="n">action</span><span class="o">.</span><span class="n">call</span> <span class="p">}</span>
    <span class="vi">@delegate</span><span class="o">.</span><span class="n">send</span><span class="p">(</span><span class="n">meth</span><span class="p">,</span> <span class="o">*</span><span class="n">args</span><span class="p">,</span> <span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
  <span class="k">end</span>

  <span class="k">def</span> <span class="nf">plz_do</span><span class="p">(</span><span class="n">this</span> <span class="o">=</span> <span class="kp">nil</span><span class="p">,</span> <span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
    <span class="k">if</span> <span class="nb">block_given?</span>
      <span class="vi">@plz_do</span> <span class="o">&lt;&lt;</span> <span class="n">block</span>
    <span class="k">elsif</span> <span class="n">this</span><span class="o">.</span><span class="n">respond_to?</span><span class="p">(</span><span class="ss">:call</span><span class="p">)</span>
      <span class="vi">@plz_do</span> <span class="o">&lt;&lt;</span> <span class="n">this</span>
    <span class="k">elsif</span> <span class="n">this</span><span class="o">.</span><span class="n">respond_to?</span><span class="p">(</span><span class="ss">:to_str</span><span class="p">)</span>
      <span class="vi">@plz_do</span> <span class="o">&lt;&lt;</span> <span class="nb">proc</span> <span class="p">{</span> <span class="nb">eval</span><span class="p">(</span><span class="n">this</span><span class="p">)</span> <span class="p">}</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre> 
 
<p>The <code class="highlight">undef_method</code> stuff is the magic thingie that undefines all the built-in methods we automatically inherit from <code class="highlight"><span class="p">&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">"co"</span><span class="p">&gt;</span>Object<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span></code> and <code class="highlight"><span class="p">&lt;</span><span class="nt">span</span> <span class="na">class</span><span class="o">=</span><span class="s">"co"</span><span class="p">&gt;</span>Kernel<span class="p">&lt;/</span><span class="nt">span</span><span class="p">&gt;</span></code>.</p>

<p>Usage:</p> 
  
<pre><code class="highlight"><span class="n">s</span> <span class="o">=</span> <span class="no">Silly</span><span class="o">.</span><span class="n">new</span>
<span class="n">s</span><span class="o">.</span><span class="n">plz_do</span> <span class="nb">proc</span> <span class="p">{</span> <span class="nb">puts</span> <span class="s2">"Hello, there"</span> <span class="p">}</span>
<span class="n">s</span><span class="o">.</span><span class="n">plz_do</span> <span class="s2">"puts 'Oh yeah!'"</span>
<span class="n">s</span><span class="o">.</span><span class="n">plz_do</span> <span class="p">{</span> <span class="nb">puts</span> <span class="s2">"BUT OMG!"</span> <span class="p">}</span>
<span class="n">s</span><span class="o">.</span><span class="n">be_cool</span>

<span class="c1"># Hello, there</span>
<span class="c1"># Oh yeah!</span>
<span class="c1"># BUT OMG!</span>
<span class="c1"># I'm so damn cool tbh</span></code></pre>

 <p>We use <code class="highlight">plz_do</code> to add stuff to the filter. All the items are stored in procs, inside an array. Those items are looped through and called before the <code class="highlight">be_cool</code> method is called.</p>

<p>Hawt!</p>
