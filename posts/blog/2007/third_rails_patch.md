---
title: "Third Rails patch"
date: "2007-12-19"
content_format: "html"
---
<p>This is probably the last time I post explicitly about patches here, it&#8217;s not special anymore</p>

<p>So right, here it is:</p>

<p><a href="http://dev.rubyonrails.org/ticket/10568">http://dev.rubyonrails.org/ticket/10568</a></p>

<p>The <tt class="inline_code">setup</tt> method is subclassed tests isn&#8217;t run. Not cool if you need to do something like this:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">FooControllerTest</span> <span class="o">&lt;</span> <span class="no">ActiveSupport</span><span class="o">::</span><span class="no">TestCase</span>
  <span class="k">def</span> <span class="nf">setup</span>
    <span class="c1"># subdomain authentication coming in!</span>
    <span class="vi">@request</span><span class="o">.</span><span class="n">host</span> <span class="o">=</span> <span class="s2">"subdomain.local.host"</span>
  <span class="k">end</span>

  <span class="k">def</span> <span class="nf">test_me</span>
    <span class="n">assert</span> <span class="n">important_thing_relying_on_subdomain</span>
  <span class="k">end</span>

  <span class="k">def</span> <span class="nf">test_but_oh_noes</span>
    <span class="k">raise</span> <span class="vi">@request</span><span class="o">.</span><span class="n">host</span><span class="o">.</span><span class="n">inspect</span>
    <span class="c1"># it'll go "test.host", which is the default</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Annoying. You could even do this:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">FooControllerTest</span> <span class="o">&lt;</span> <span class="no">ActiveSupport</span><span class="o">::</span><span class="no">TestCase</span>
  <span class="k">def</span> <span class="nf">setup</span>
    <span class="k">raise</span> <span class="s2">"BUT OMG LOL"</span>
  <span class="k">end</span>

  <span class="k">def</span> <span class="nf">test_me</span>
    <span class="n">assert</span> <span class="n">important_thing_relying_on_subdomain</span>
  <span class="k">end</span>

  <span class="k">def</span> <span class="nf">test_but_oh_noes</span>
    <span class="n">assert</span> <span class="n">something_else</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>And none of the test would get raised, because the <tt class="inline_code">setup</tt> method simply doesn&#8217;t run.</p> 

<p>This was because of fancyness added in <a href="http://dev.rubyonrails.org/changeset/8392">changeset #8392</a>. <a href="http://www.brynary.com/">Brynary</a> is working some magic, so it&#8217;ll hopefully be a fix soon. If not, it&#8217;ll get rolled back. Yarr.</p>
