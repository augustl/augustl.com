---
title: "Result equals new array"
date: "2008-09-12"
content_format: "html"
archive_order: 76
---
<p>If you ever find yourself doing <code class="highlight">result = []</code>, follewed by modifying the <code class="highlight">result</code>, and and then returning it when you've finished modifying it, you're letting everyone know you don't know how to program in Ruby.</p>

<h2>detect</h2>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">accepted_users</span>
  <span class="n">result</span> <span class="o">=</span> <span class="o">[]</span>
  <span class="n">users</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span><span class="o">|</span><span class="n">u</span><span class="o">|</span> <span class="n">result</span> <span class="o">&lt;&lt;</span> <span class="n">u</span> <span class="k">if</span> <span class="n">u</span><span class="o">.</span><span class="n">accepted?</span> <span class="p">}</span>
  <span class="k">return</span> <span class="n">result</span>
<span class="k">end</span></code></pre>

<p>No. <code class="highlight">each</code> is for looping, not selecting certain items.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">accepted_users</span>
  <span class="n">users</span><span class="o">.</span><span class="n">select</span> <span class="p">{</span><span class="o">|</span><span class="n">u</span><span class="o">|</span> <span class="n">u</span><span class="o">.</span><span class="n">accepted?</span> <span class="p">}</span>
<span class="k">end</span></code></pre>

<h2>map</h2>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">for_select</span><span class="p">(</span><span class="n">items</span><span class="p">)</span>
  <span class="n">result</span> <span class="o">=</span> <span class="o">[]</span>
  <span class="n">items</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span><span class="o">|</span><span class="n">i</span><span class="o">|</span> <span class="n">result</span> <span class="o">&lt;&lt;</span> <span class="s2">"&lt;option&gt;</span><span class="si">#{</span><span class="n">i</span><span class="si">}</span><span class="s2">&lt;/option&gt;"</span> <span class="p">}</span>
  <span class="k">return</span> <span class="n">result</span>
<span class="k">end</span></code></pre>

<p>No again. <code class="highlight">each</code> is for looping, not mapping.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">for_select</span><span class="p">(</span><span class="n">items</span><span class="p">)</span>
  <span class="n">items</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span><span class="o">|</span><span class="n">i</span><span class="o">|</span> <span class="s2">"&lt;option&gt;</span><span class="si">#{</span><span class="n">i</span><span class="si">}</span><span class="s2">&lt;/option&gt;"</span> <span class="p">}</span>
<span class="k">end</span></code></pre>

<h2>Magic mofo - inject</h2>

<p>What exactly is happening when one does <code class="highlight">result = []</code> stuff?</p>

<dl>
  <dt>Create</dt>
  <dd><code class="highlight">result = []</code></dd>

  <dt>Loop and alter</dt>
  <dd><code class="highlight">(1..10).each {|i| result += i }</code></dd>

  <dt>Return</dt>
  <dd><code class="highlight">result</code></dd>
</dl>

<p>This is exactly what inject does, too. Initial object, loop through the items, add stuff on each iteration, and return the initial object. But it lets you one-line the process.</p>

<pre><code class="highlight"><span class="p">(</span><span class="mi">1</span><span class="o">..</span><span class="mi">10</span><span class="p">)</span><span class="o">.</span><span class="n">inject</span><span class="p">(</span><span class="mi">0</span><span class="p">)</span> <span class="p">{</span><span class="o">|</span><span class="n">result</span><span class="p">,</span> <span class="n">i</span><span class="o">|</span> <span class="n">result</span> <span class="o">+</span> <span class="n">i</span> <span class="p">}</span>
<span class="c1"># =&gt; 55</span></code></pre>

<p>Here's another example. First, the evil <code class="highlight">result = {}</code> (it's not an array, but the concept is the same):</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">filenames_with_path</span><span class="p">(</span><span class="n">filenames</span><span class="p">)</span>
  <span class="n">result</span> <span class="o">=</span> <span class="p">{}</span>
  <span class="n">filenames</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span><span class="o">|</span><span class="n">d</span><span class="o">|</span> <span class="n">result</span><span class="o">.</span><span class="n">merge!</span><span class="p">(</span><span class="s2">"/path/to/</span><span class="si">#{</span><span class="n">d</span><span class="si">}</span><span class="s2">"</span> <span class="o">=&gt;</span> <span class="n">d</span><span class="p">)</span> <span class="p">}</span>
  <span class="n">result</span>
<span class="k">end</span>

<span class="n">filenames_with_path</span><span class="p">(</span><span class="o">[</span><span class="s1">'foo.txt'</span><span class="p">,</span> <span class="s1">'bar.pdf'</span><span class="p">,</span> <span class="s1">'hello.jpg'</span><span class="o">]</span><span class="p">)</span>
<span class="c1"># =&gt; {"/path/to/bar.pdf"=&gt;"bar.pdf", "/path/to/foo.txt"=&gt;"foo.txt", "/path/to/hello.jpg"=&gt;"hello.jpg"}</span></code></pre>

<p>Then, an inject version. A sensible one-liner.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">filenames_with_path</span><span class="p">(</span><span class="n">filenames</span><span class="p">)</span>
  <span class="n">filenames</span><span class="o">.</span><span class="n">inject</span><span class="p">({})</span> <span class="p">{</span><span class="o">|</span><span class="n">result</span><span class="p">,</span> <span class="n">d</span><span class="o">|</span> <span class="n">result</span><span class="o">.</span><span class="n">merge!</span><span class="p">(</span><span class="s2">"/path/to/</span><span class="si">#{</span><span class="n">d</span><span class="si">}</span><span class="s2">"</span> <span class="o">=&gt;</span> <span class="n">d</span><span class="p">)</span> <span class="p">}</span>
<span class="k">end</span>

<span class="n">filenames_with_path</span><span class="p">(</span><span class="o">[</span><span class="s1">'foo.txt'</span><span class="p">,</span> <span class="s1">'bar.pdf'</span><span class="p">,</span> <span class="s1">'hello.jpg'</span><span class="o">]</span><span class="p">)</span>
<span class="c1"># =&gt; {"/path/to/bar.pdf"=&gt;"bar.pdf", "/path/to/foo.txt"=&gt;"foo.txt", "/path/to/hello.jpg"=&gt;"hello.jpg"}</span></code></pre>

<h2>Inject can do anything</h2>

<p>Don't go too wild, though. <code class="highlight">inject</code> can do everything <code class="highlight">map</code>, <code class="highlight">detect</code> etc. can. Both of those methods returns a new object, you know. Exactly as <code class="highlight">inject</code>.</p>

<p>The result of these two calls are identical, as you can see:</p>

<pre><code class="highlight"><span class="n">data</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"foo"</span><span class="p">,</span> <span class="s2">"bar"</span><span class="p">,</span> <span class="s2">"baz"</span><span class="o">]</span>

<span class="n">data</span><span class="o">.</span><span class="n">inject</span><span class="p">(</span><span class="o">[]</span><span class="p">)</span> <span class="p">{</span><span class="o">|</span><span class="n">result</span><span class="p">,</span> <span class="n">i</span><span class="o">|</span> <span class="n">result</span><span class="o">.</span><span class="n">push</span><span class="p">(</span><span class="s2">"</span><span class="si">#{</span><span class="n">i</span><span class="si">}</span><span class="s2"> is nice"</span><span class="p">)</span> <span class="p">}</span>
<span class="c1"># =&gt; ["foo is nice", "bar is nice", "baz is nice"]</span>

<span class="n">data</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span><span class="o">|</span><span class="n">i</span><span class="o">|</span> <span class="s2">"</span><span class="si">#{</span><span class="n">i</span><span class="si">}</span><span class="s2"> is nice"</span> <span class="p">}</span>  
<span class="c1"># =&gt; ["foo is nice", "bar is nice", "baz is nice"]</span></code></pre>


<h2>Important to know about inject</h2>

<p>This fails:</p>

<pre><code class="highlight"><span class="o">[</span><span class="s2">"foo"</span><span class="p">,</span> <span class="s2">"bar"</span><span class="o">].</span><span class="n">inject</span><span class="p">({})</span> <span class="p">{</span><span class="o">|</span><span class="n">data</span><span class="p">,</span> <span class="n">i</span><span class="o">|</span> <span class="n">data</span><span class="o">[</span><span class="s2">"</span><span class="si">#{</span><span class="n">i</span><span class="si">}</span><span class="s2"> is cool"</span><span class="o">]</span> <span class="o">=</span> <span class="n">i</span> <span class="p">}</span>
<span class="c1"># =&gt; IndexError: string not matched</span></code></pre>

<p>This does not:</p>

<pre><code class="highlight"><span class="o">[</span><span class="s2">"foo"</span><span class="p">,</span> <span class="s2">"bar"</span><span class="o">].</span><span class="n">inject</span><span class="p">({})</span> <span class="p">{</span><span class="o">|</span><span class="n">data</span><span class="p">,</span> <span class="n">i</span><span class="o">|</span> <span class="n">data</span><span class="o">.</span><span class="n">merge</span><span class="p">(</span><span class="s2">"</span><span class="si">#{</span><span class="n">i</span><span class="si">}</span><span class="s2"> is cool"</span> <span class="o">=&gt;</span> <span class="n">i</span><span class="p">)</span> <span class="p">}</span>
<span class="c1"># =&gt; {"bar is cool"=&gt;"bar", "foo is cool"=&gt;"foo"}</span></code></pre>

<p>Here's how inject works:</p>

<dl>
  <dt>Initial object</dt>
  <dd>Call inject on an array or a hash, and give it an object (<code class="highlight">{}</code>, an empty hash) it should work on.</dd>

  <dt>Start looping</dt>
  <dd>Loop through all the items in the array or hash we called <code class="highlight">inject</code> on.</dd>

  <dt>First iteration</dt>
  <dd>Yield the object passed to inject (<code class="highlight">data</code>) and the first object in the collection we called <code class="highlight">inject</code> on (<code class="highlight">"foo"</code>).</dd>

  <dt>Subsequent iterations</dt>
  <dd>Yield whatever the previous iteration returned and the subsequent object in the collection we called <code class="highlight">inject</code> on.</dd>
</dl>

<p>This means that we have to be careful what we do in our block. In the example above, this happened:</p>

<dl>
  <dt>Did not work</dt>
  <dd><code class="highlight">data["#{i} is cool"] = i</code></dd>

  <dt>Worked</dt>
  <dd><code class="highlight">data.merge("#{i} is cool" =&gt; i)</code></dd>
</dl>

<p>As mentioned, when <code class="highlight">inject</code> loops through the items, the <code class="highlight">data</code> part is whatever the previous iteration returned. Let's have a look at what the two calls returns.</p>

<pre><code class="highlight"><span class="n">data</span><span class="o">[</span><span class="s2">"</span><span class="si">#{</span><span class="n">i</span><span class="si">}</span><span class="s2"> is cool"</span><span class="o">]</span> <span class="o">=</span> <span class="n">i</span>
<span class="c1"># =&gt; "foo"</span>

<span class="n">data</span><span class="o">.</span><span class="n">merge</span><span class="p">(</span><span class="s2">"</span><span class="si">#{</span><span class="n">i</span><span class="si">}</span><span class="s2"> is cool"</span> <span class="o">=&gt;</span> <span class="n">i</span><span class="p">)</span>
<span class="c1"># =&gt; {"foo is cool" =&gt; "foo"}</span></code></pre>

<p>The reason <code class="highlight">data["#{i} is cool"] = i</code> did not work, is that on the second iteration, <code class="highlight">data</code> was the string <code class="highlight">"foo"</code>. And obviously, <code class="highlight">"foo"["#{i} is cool"] = i</code> is not what we're looking for.</p>

<p>The reason <code class="highlight">data.merge("#{i} is cool" =&gt; i)</code> worked, is that on the second iteration, <code class="highlight">data</code> was the hash <code class="highlight">{"foo is cool" =&gt; "foo"}</code>. And, <code class="highlight">{"foo is cool" =&gt; "foo"}.merge("#{i} is cool" =&gt; i)</code> is exactly what we're looking for.</p>

<p>You should probably read this section a couple of times and make sure you grok all of it.</p>


<h2>You rock!</h2>

<p>Congratulations, you're now an awesome Ruby programmer that knows how to use powerul enumerable methods such as <code class="highlight">detect</code>, <code class="highlight">map</code> and last but not least <code class="highlight">inject</code>!</p>
