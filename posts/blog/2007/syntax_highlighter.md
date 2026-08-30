---
title: "Syntax highlighter"
date: "2007-11-26"
content_format: "html"
---
<p>How I syntax highlight code in this blog. CodeRay + regular expressions.</p>  
 
<p>I&#8217;m using this app-only plugin called <tt>cache_html</tt>. It lets me do this:</p> 
 
<pre><code class="highlight"><span class="k">class</span> <span class="nc">Post</span> <span class="o">&lt;</span> <span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="n">cache_html</span> <span class="ss">:intro</span><span class="p">,</span> <span class="ss">:content</span>
<span class="k">end</span></code></pre>

<p>This runs some parsing &#8211; textile and coderay &#8211; on that content, and stores it in <tt>[column_name]_html</tt>. Honestly, that&#8217;s kind of useless, as this app is using page caching, but oh well.  Even the <span class="caps">RSS</span> feed is page cached, yawn.</p>
  
<p>So, the <code class="highlight">cache_html</code> does it&#8217;s thing <code class="highlight">before_save</code>, and this is one of the things:</p> 
 
 
<pre><code class="highlight"><span class="k">def</span> <span class="nf">coderay</span><span class="p">(</span><span class="n">text</span><span class="p">)</span>
  <span class="n">duped</span> <span class="o">=</span> <span class="n">text</span><span class="o">.</span><span class="n">dup</span>
  <span class="n">expression</span> <span class="o">=</span> <span class="sr">/(&lt;source(?:\:([a-z]+))?&gt;(.+?)&lt;\/source&gt;)/m</span>
  <span class="n">text</span><span class="o">.</span><span class="n">scan</span><span class="p">(</span><span class="n">expression</span><span class="p">)</span> <span class="k">do</span> <span class="o">|</span><span class="n">all</span><span class="p">,</span> <span class="n">language</span><span class="p">,</span> <span class="n">code</span><span class="o">|</span>
    <span class="n">language</span> <span class="o">||=</span> <span class="ss">:ruby</span>

    <span class="k">if</span> <span class="p">(</span><span class="n">code</span><span class="o">.</span><span class="n">scan</span><span class="p">(</span><span class="sr">/\n/</span><span class="p">))</span><span class="o">.</span><span class="n">empty?</span> <span class="c1"># has no newlines?</span>
      <span class="n">highlighted</span> <span class="o">=</span> <span class="s1">'&lt;span class="inline_code"&gt;'</span>
      <span class="n">highlighted</span> <span class="o">+=</span> <span class="no">CodeRay</span><span class="o">.</span><span class="n">scan</span><span class="p">(</span><span class="n">code</span><span class="p">,</span> <span class="n">language</span><span class="o">.</span><span class="n">to_sym</span><span class="p">)</span><span class="o">.</span><span class="n">div</span><span class="p">(</span><span class="ss">:wrap</span> <span class="o">=&gt;</span> <span class="kp">nil</span><span class="p">,</span> <span class="ss">:css</span> <span class="o">=&gt;</span> <span class="ss">:class</span><span class="p">)</span>
      <span class="n">highlighted</span> <span class="o">+=</span> <span class="s1">'&lt;/span&gt;'</span>
    <span class="k">else</span>
      <span class="n">code</span><span class="o">.</span><span class="n">strip!</span>
      <span class="n">highlighted</span> <span class="o">=</span> <span class="no">CodeRay</span><span class="o">.</span><span class="n">scan</span><span class="p">(</span><span class="n">code</span><span class="p">,</span> <span class="n">language</span><span class="o">.</span><span class="n">to_sym</span><span class="p">)</span><span class="o">.</span><span class="n">div</span><span class="p">(</span><span class="ss">:css</span> <span class="o">=&gt;</span> <span class="ss">:class</span><span class="p">)</span>
    <span class="k">end</span>

    <span class="n">duped</span><span class="o">.</span><span class="n">gsub!</span><span class="p">(</span><span class="n">all</span><span class="p">,</span> <span class="s2">"&lt;notextile&gt;</span><span class="si">#{</span><span class="n">highlighted</span><span class="si">}</span><span class="s2">&lt;/notextile&gt;"</span><span class="p">)</span>
  <span class="k">end</span>

  <span class="n">duped</span>
<span class="k">end</span></code></pre>
 
<p>There ya go. Some notes:</p> 
 
 
<ul> 
  <li>It&#8217;s dirty. This is strictly <code class="highlight">ActionView</code> stuff. I should have used <code class="highlight">content_tag</code> and all sorts of neat helpers, but I can&#8217;t do that, as I&#8217;m in the <code class="highlight">ActiveRecord</code> scope.</li> 
  <li>It&#8217;s looking for <tt>&lt;source&gt;</tt> tags, and highlights that. I can also go <tt>&lt;source:language&gt;</tt>. It&#8217;s Ruby by default.</li> 
  <li>I&#8217;m doing <code class="highlight">dup</code> because a string can&#8217;t modify (<code class="highlight">gsub</code>) itself inside a <code class="highlight">scan</code> block.</li> 
  <li>It scans the content for newlines. If there&#8217;s no newlines around, it&#8217;s considered an in-line code sample.</li> 
  <li><tt>&lt;notextile&gt;</tt> makes sure textile doesn&#8217;t parse the code samples (that&#8217;d be rather silly)</li> 
</ul>
