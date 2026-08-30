---
title: "<code>to_proc</code>"
date: "2008-09-08"
content_format: "html"
---
<p>You've probably seen this in Rails:</p>

<pre><code class="highlight"><span class="no">User</span><span class="o">.</span><span class="n">find</span><span class="p">(</span><span class="ss">:all</span><span class="p">)</span><span class="o">.</span><span class="n">map</span><span class="p">(</span><span class="o">&amp;</span><span class="ss">:name</span><span class="p">)</span></code></pre>

<p>It is the equivalent of doing:</p>

<pre><code class="highlight"><span class="no">User</span><span class="o">.</span><span class="n">find</span><span class="p">(</span><span class="ss">:all</span><span class="p">)</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span><span class="o">|</span><span class="nb">p</span><span class="o">|</span> <span class="nb">p</span><span class="o">.</span><span class="n">name</span> <span class="p">}</span></code></pre>

<p>The technique in question is called "symbol to proc". First, let's examine <code class="highlight">to_proc</code>.</p>

<h2><code class="highlight">to_proc</code></h2>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">call_a_proc</span><span class="p">(</span><span class="o">&amp;</span><span class="nb">proc</span><span class="p">)</span>
  <span class="nb">proc</span><span class="o">.</span><span class="n">call</span>
<span class="k">end</span>

<span class="n">leethal</span> <span class="o">=</span> <span class="s2">"some guy"</span>

<span class="n">call_a_proc</span><span class="p">(</span><span class="o">&amp;</span><span class="n">leethal</span><span class="p">)</span>
<span class="c1"># =&gt; TypeError: wrong argument type String (expected Proc)</span></code></pre>

<p>Yeah, this is pretty odd. It's about time someone lets you in on a little secret:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">String</span>
  <span class="k">def</span> <span class="nf">to_proc</span>
    <span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span> <span class="nb">puts</span> <span class="s2">"I am a proc"</span> <span class="p">}</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="n">call_a_proc</span><span class="p">(</span><span class="o">&amp;</span><span class="n">leethal</span><span class="p">)</span>
<span class="c1"># =&gt; I am a proc</span></code></pre>

<p>The object responds to a <code class="highlight">to_proc</code> method now, and Ruby calls it.</p>

<h2>Back to Rails</h2>

<p>So what is Rails doing that lets us do <code class="highlight">map(&amp;:name)</code>?</p>
  
<pre><code class="highlight"><span class="k">class</span> <span class="nc">Symbol</span>
  <span class="k">def</span> <span class="nf">to_proc</span>
    <span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span> <span class="o">|*</span><span class="n">args</span><span class="o">|</span> <span class="n">args</span><span class="o">.</span><span class="n">shift</span><span class="o">.</span><span class="n">__send__</span><span class="p">(</span><span class="nb">self</span><span class="p">,</span> <span class="o">*</span><span class="n">args</span><span class="p">)</span> <span class="p">}</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>That's right, it defines <code class="highlight">to_proc</code> on <code class="highlight">Symbol</code>.</p>

<p>Because of the to_proc magic, and because all methods that accepts blocks can take a proc instead, <code class="highlight">map(&amp;:name)</code> now works as a shortcut to <code class="highlight">map {|i| i.name }</code>, thanks to this single line of code.</p>

<p>By the way, Rails could have been doing this:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Symbol</span>
  <span class="k">def</span> <span class="nf">to_proc</span>
    <span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span><span class="o">|</span><span class="n">arg</span><span class="o">|</span> <span class="n">arg</span><span class="o">.</span><span class="n">__send__</span><span class="p">(</span><span class="nb">self</span><span class="p">)</span> <span class="p">}</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Many people says Rails _should_ do this, because of performance issues. With Rails' implementation, though, this works:</p>

<pre><code class="highlight"><span class="o">[</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">,</span> <span class="mi">3</span><span class="o">].</span><span class="n">inject</span><span class="p">(</span><span class="o">&amp;</span><span class="ss">:+</span><span class="p">)</span>
<span class="c1"># =&gt; 6</span></code></pre>

<p>Don't worry, you don't have to understand exactly what that <code class="highlight">to_proc</code> code does. Feel free to investigate the matter until you do, though.</p>
