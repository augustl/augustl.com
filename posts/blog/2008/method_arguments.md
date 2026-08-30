---
title: "Method arguments"
date: "2008-09-10"
content_format: "html"
---
<p>An introduction to the stuff your mom and dad didn't tell you about giving arguments to methods.</p>

<h2>The asterisk</h2>

<p>Capture x amount of arguments.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">silly_list</span><span class="p">(</span><span class="o">*</span><span class="n">args</span><span class="p">)</span>
  <span class="n">args</span><span class="o">.</span><span class="n">join</span><span class="p">(</span><span class="s1">' '</span><span class="p">)</span> <span class="o">+</span> <span class="s1">'.'</span>
<span class="k">end</span>

<span class="n">silly_list</span> <span class="s1">'My'</span><span class="p">,</span> <span class="s1">'hovercraft'</span><span class="p">,</span> <span class="s1">'is'</span><span class="p">,</span> <span class="s1">'full'</span><span class="p">,</span> <span class="s1">'of'</span><span class="p">,</span> <span class="s1">'eels'</span>
<span class="s2">"My hovercraft is full of eels."</span></code></pre>

<p>You can also do it the other way around, when calling a method. This will pass each item in the array as a separate argument to the method.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">say_a_name</span><span class="p">(</span><span class="n">first</span><span class="p">,</span> <span class="n">last</span><span class="p">)</span>
  <span class="nb">puts</span> <span class="s2">"</span><span class="si">#{</span><span class="n">last</span><span class="si">}</span><span class="s2">, </span><span class="si">#{</span><span class="n">first</span><span class="si">}</span><span class="s2">"</span>
<span class="k">end</span>

<span class="nb">name</span> <span class="o">=</span> <span class="o">[</span><span class="s1">'John'</span><span class="p">,</span> <span class="s1">'McClaine'</span><span class="o">]</span>
<span class="n">say_a_name</span><span class="p">(</span><span class="o">*</span><span class="nb">name</span><span class="p">)</span>
<span class="c1"># =&gt; "McClaine, John"</span>

<span class="nb">name</span> <span class="o">=</span> <span class="o">[</span><span class="s1">'John'</span><span class="p">,</span> <span class="s1">'Leethal'</span><span class="p">,</span> <span class="s1">'McClaine'</span><span class="o">]</span>
<span class="n">say_a_name</span><span class="p">(</span><span class="o">*</span><span class="nb">name</span><span class="p">)</span>
<span class="c1"># =&gt; ArgumentError: wrong number of arguments (3 for 2)</span></code></pre>

<h2>The ampersand</h2>

<p>Capture the block.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">can_has_block</span><span class="p">(</span><span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
  <span class="nb">puts</span> <span class="n">block</span><span class="o">.</span><span class="n">inspect</span>
<span class="k">end</span>

<span class="n">can_has_block</span>
<span class="c1"># =&gt; nil</span>

<span class="n">can_has_block</span> <span class="p">{</span> <span class="s2">"Here is a block"</span> <span class="p">}</span>
<span class="c1"># =&gt; #&lt;Proc:0x0008f138@-:8&gt;</span></code></pre>

<p>You can also do it the other way around, when calling a method. This will pass the proc to the method as if you were giving it a normal block. The last two calls are identical:</p>

<pre><code class="highlight"><span class="n">a_proc</span> <span class="o">=</span> <span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span> <span class="nb">puts</span> <span class="s2">"I am a proc"</span> <span class="p">}</span>

<span class="k">def</span> <span class="nf">call_the_block</span>
  <span class="k">yield</span>
<span class="k">end</span>

<span class="n">call_the_block</span> <span class="p">{</span> <span class="nb">puts</span> <span class="s2">"I am a block"</span> <span class="p">}</span>
<span class="c1"># =&gt; I am a block</span>
<span class="n">call_the_block</span> <span class="p">{</span> <span class="n">a_proc</span><span class="o">.</span><span class="n">call</span> <span class="p">}</span>
<span class="c1"># =&gt; "I am a proc"</span>
<span class="n">call_the_block</span><span class="p">(</span><span class="o">&amp;</span><span class="n">a_proc</span><span class="p">)</span>
<span class="c1"># =&gt; "I am a proc"</span></code></pre>

<p>And then, of course, without the ampersand Ruby treats the proc as any other object passed as an argument.</p>

<pre><code class="highlight"><span class="n">call_the_block</span><span class="p">(</span><span class="n">a_proc</span><span class="p">)</span>
<span class="c1"># =&gt; ArgumentError: wrong number of arguments (1 for 0)</span></code></pre>


<h2>Both?</h2>

<p>Of course! Let's use every trick in the book.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">another_map</span><span class="p">(</span><span class="o">*</span><span class="n">args</span><span class="p">,</span> <span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
  <span class="n">args</span><span class="o">.</span><span class="n">map</span><span class="p">(</span><span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
<span class="k">end</span>

<span class="n">another_map</span><span class="p">(</span><span class="s1">'hello'</span><span class="p">,</span> <span class="s1">'there'</span><span class="p">)</span> <span class="p">{</span><span class="o">|</span><span class="n">i</span><span class="o">|</span> <span class="n">i</span><span class="o">.</span><span class="n">upcase</span> <span class="p">}</span>
<span class="c1"># =&gt; ["HELLO", "THERE"]</span></code></pre>

<h2>Yield</h2>

<p>Don't forget yield, though. These two calls are identical.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">say_hello</span><span class="p">(</span><span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
  <span class="n">block</span><span class="o">.</span><span class="n">call</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nf">say_hello</span>
  <span class="k">yield</span>
<span class="k">end</span></code></pre>

<p>In fact, <code class="highlight">yield</code> is much better, as Ruby doesn't have to instantize a <code class="highlight">Proc</code> object.</p>

<h2>Default values</h2>

<p>You probably knew this already.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">a_default_value</span><span class="p">(</span><span class="n">value</span> <span class="o">=</span> <span class="p">{})</span>
  <span class="n">value</span>
<span class="k">end</span>

<span class="n">a_default_value</span>
<span class="c1"># =&gt; {}</span>

<span class="n">a_default_value</span><span class="p">(</span><span class="s2">"hello!"</span><span class="p">)</span>
<span class="c1"># =&gt; "hello!"</span></code></pre>
