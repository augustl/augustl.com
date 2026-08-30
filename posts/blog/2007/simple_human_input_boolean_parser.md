---
title: "Simple human input boolean parser"
date: "2007-11-24"
content_format: "html"
archive_order: 97
---
<p>Parsing human input &#8211; &#8220;yes&#8221;, &#8220;no&#8221;, &#8220;t&#8221; and so on &#8211; and converts it to a boolean, with a simple interface.</p> 

<p>Converts human input to a boolean. Used this in a keyword search thingie of mine, whene users could go <tt>published:true</tt>, <tt>published:yes</tt>, <tt>published:0</tt> and so on, and have the booleans parsed properly.</p>

<pre><code class="highlight"><span class="no">TRUE_VALUES</span> <span class="o">=</span> <span class="sx">%w( yes y true t 1 )</span>
<span class="no">FALSE_VALUES</span> <span class="o">=</span> <span class="sx">%w( no n false f 0 )</span>

<span class="k">class</span> <span class="nc">String</span>
  <span class="k">def</span> <span class="nf">to_boolean</span>
    <span class="k">case</span> <span class="nb">self</span><span class="o">.</span><span class="n">downcase</span><span class="o">.</span><span class="n">strip</span>
    <span class="k">when</span> <span class="o">*</span><span class="no">TRUE_VALUES</span>
      <span class="kp">true</span>
    <span class="k">when</span> <span class="o">*</span><span class="no">FALSE_VALUES</span>
      <span class="kp">false</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Adapt the constants to your needs. Any unmatched value would simply return nil.</p> 
 
<pre><code class="highlight"><span class="s2">"yes"</span><span class="o">.</span><span class="n">to_boolean</span>
<span class="c1"># =&gt; true</span>

<span class="s2">"no"</span><span class="o">.</span><span class="n">to_boolean</span>
<span class="c1"># =&gt; false</span>

<span class="s2">"1"</span><span class="o">.</span><span class="n">to_boolean</span>
<span class="c1"># =&gt; true</span>

<span class="s2">"kitten"</span><span class="o">.</span><span class="n">to_boolean</span>
<span class="c1"># =&gt; nil</span></code></pre>
