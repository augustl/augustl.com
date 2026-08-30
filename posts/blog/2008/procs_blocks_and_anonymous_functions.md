---
title: "Procs, blocks and anonymous functions"
date: "2008-11-08"
content_format: "html"
---
<p>This is a Big Picture&#8482; post. I will attempt to give you a thorough understanding of how blocks and procs works in Ruby by showing examples and explaining basics. I will also show some examples from other languages, namely Javascript and Lua, in order to really expand on the Big Picture&#8482; in this article.</p>

<h2>Storing pieces of code</h2>

<p>In Ruby, you can store pieces of code and execute them on demand; methods. You define the method, add code to the method body, and run the method whenever you want.</p>

<p>In addition to methods, there is another way in Ruby to store code that you can call later; procs.</p>

<pre><code class="highlight"><span class="n">say_hello</span> <span class="o">=</span> <span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span> <span class="nb">puts</span> <span class="s2">"Hello!"</span> <span class="p">}</span></code></pre>

<p>Contrary to what you might expect, the <code class="highlight">puts</code> doesn&#8217;t run. Ruby only <em>stores</em> the code inside the proc, it doesn&#8217;t <em>run</em> it. Not yet, at least. It runs when we tell it to. Let&#8217;s run it right away. Remember, we stored the proc in the <code class="highlight">say_hello</code> variabe.</p>

<pre><code class="highlight"><span class="n">say_hello</span><span class="o">.</span><span class="n">call</span>
<span class="c1"># =&gt; "Hello!"</span></code></pre>

<p>So, there you go. That&#8217;s what procs are, and that is all there is to it. But how the fsck is this useful to anyone? Why not just use methods?</p>

<h2>Organizing your code with procs</h2>

<p>Procs are useful code organization tools. Let&#8217;s say that you want to calculate the running time for a few code snippets, in order to benchmark them. To do this elegantly, you want to be able to call a method and pass some code to it, and have the execution time returned.</p>

<p>Here&#8217;s how you can use procs to do just that:</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">time</span><span class="p">(</span><span class="n">a_proc</span><span class="p">)</span>
  <span class="n">start</span> <span class="o">=</span> <span class="no">Time</span><span class="o">.</span><span class="n">now</span>
  <span class="n">a_proc</span><span class="o">.</span><span class="n">call</span>
  <span class="nb">puts</span> <span class="no">Time</span><span class="o">.</span><span class="n">now</span> <span class="o">-</span> <span class="n">start</span>
<span class="k">end</span>
 
<span class="n">time</span><span class="p">(</span><span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span> <span class="n">code_here</span> <span class="p">})</span>
<span class="n">time</span><span class="p">(</span><span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span> <span class="n">more_code_here</span> <span class="p">})</span></code></pre>

<p>The execution times of the code inside the procs will be neatly displayed as you run this code. Try it yourself, right now! You can use <code class="highlight">sleep(2)</code>, <code class="highlight">1000.times { 5 + 5 }</code>, or anything else you might want to speed test.</p>

<h2>Blocks!</h2>

<p>In addition to method arguments, a method can also take a block. Passing a block is essentially the same as passing a proc, except that the syntax is different (and nicer), and you don&#8217;t have to type as much. Other than that, procs and blocks are essential the same thing: code that you can call later on.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">time</span>
  <span class="n">start</span> <span class="o">=</span> <span class="no">Time</span><span class="o">.</span><span class="n">now</span>
  <span class="k">yield</span>
  <span class="nb">puts</span> <span class="no">Time</span><span class="o">.</span><span class="n">now</span> <span class="o">-</span> <span class="n">start</span>
<span class="k">end</span>
 
<span class="n">time</span> <span class="p">{</span> <span class="n">code_here</span> <span class="p">}</span>
<span class="n">time</span> <span class="p">{</span> <span class="n">more_code_here</span> <span class="p">}</span></code></pre>

<p>Looks a lot nicer, doesn&#8217;t it? Upon further inspection, it is easy to see where procs and blocks differs. Comparing the two examples, we can see that the <code class="highlight">time</code> method no longer takes an argument. A block is a special internal thing in Ruby, so you don&#8217;t need to specify a method argument for the block. Also, we use <code class="highlight">yield</code> instead of <code class="highlight">a_proc.call</code>. <code class="highlight">yield</code> is a special keyword in Ruby, telling Ruby to call the code in the block that was passed to that method. Lastly, actually passing the code to the method has a different syntax. No parentheses, because the block is not an argument. No <code class="highlight">Proc.new</code> either, because we aren&#8217;t creating a proc, we are passing a block.</p>

<h2>Passing arguments to procs and blocks</h2>

<p>When you <code class="highlight">yield</code> or <code class="highlight">call</code>, you can pass arguments to the proc or block at the same time. A dumb example:</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">dumb_hello_world_test</span>
  <span class="k">yield</span><span class="p">(</span><span class="mi">5</span><span class="p">)</span>
<span class="k">end</span>

<span class="n">dumb_hello_world_test</span> <span class="p">{</span><span class="o">|</span><span class="n">i</span><span class="o">|</span> <span class="nb">puts</span> <span class="n">i</span> <span class="o">*</span> <span class="mi">2</span> <span class="p">}</span>
<span class="c1"># =&gt; 10</span>

<span class="n">my_silly_proc</span> <span class="o">=</span> <span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span><span class="o">|</span><span class="nb">name</span><span class="o">|</span> <span class="nb">puts</span> <span class="nb">name</span><span class="o">.</span><span class="n">upcase</span> <span class="p">}</span>
<span class="n">my_silly_proc</span><span class="o">.</span><span class="n">call</span><span class="p">(</span><span class="s2">"August Lilleaas"</span><span class="p">)</span>
<span class="c1"># =&gt; "AUGUST LILLEAAS"</span></code></pre>

<p>You have probably seen blocks taking arguments before: <code class="highlight">each</code>, <code class="highlight">map</code> and other enumerable methods does this.</p>

<pre><code class="highlight"><span class="o">[</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">,</span> <span class="mi">3</span><span class="o">].</span><span class="n">map</span> <span class="p">{</span><span class="o">|</span><span class="n">i</span><span class="o">|</span> <span class="nb">puts</span> <span class="n">i</span> <span class="o">*</span> <span class="mi">2</span> <span class="p">}</span>
<span class="c1"># =&gt; 2</span>
<span class="c1"># =&gt; 4</span>
<span class="c1"># =&gt; 6</span></code></pre>

<p>That&#8217;s right: map takes a block. The block gets an argument: the number in the array. Now, for something hardcore. Let&#8217;s play with an implementation of <code class="highlight">Array#each</code>.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Array</span>
  <span class="k">def</span> <span class="nf">each</span>
    <span class="n">i</span> <span class="o">=</span> <span class="mi">0</span>
    <span class="k">while</span><span class="p">(</span><span class="n">i</span> <span class="o">&lt;</span> <span class="nb">self</span><span class="o">.</span><span class="n">length</span><span class="p">)</span> <span class="k">do</span>
      <span class="k">yield</span><span class="p">(</span><span class="nb">self</span><span class="o">[</span><span class="n">i</span><span class="o">]</span><span class="p">)</span>
      <span class="n">i</span> <span class="o">+=</span> <span class="mi">1</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="n">my_array</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"a"</span><span class="p">,</span> <span class="s2">"b"</span><span class="p">,</span> <span class="s2">"c"</span><span class="o">]</span>
<span class="n">my_array</span><span class="o">.</span><span class="n">each</span> <span class="p">{</span><span class="o">|</span><span class="n">letter</span><span class="o">|</span> <span class="nb">puts</span> <span class="n">letter</span> <span class="p">}</span>
<span class="c1"># =&gt; "a"</span>
<span class="c1"># =&gt; "b"</span>
<span class="c1"># =&gt; "c"</span></code></pre>

<p>We iterate the items in the array, and call the block &mdash; yield &mdash; for every item in the array. When we yield, we pass the current array iteration to the block.</p>

<h2>The big picture: blocks and procs in other languages.</h2>

<p>Ruby isn&#8217;t the only language that lets you pass around chunks of code. Here are some examples in Javascript and Lua. Despite their obvious use case differences, these two languages are pretty similar.</p>

<p>Remember how you can use both methods and procs/blocks to store chunks of code in Ruby? In JS/Lua, methods and procs/blocks are replaced by functions. This is possible because, unlike Ruby, you can refer to a function by name without calling it, or create anonymous functions.</p>

<pre><code class="highlight"><span class="c1">// javascript</span>
<span class="kd">var</span> <span class="nx">sayHello</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(){</span>
  <span class="nx">alert</span><span class="p">(</span><span class="s2">"Hello, World!"</span><span class="p">);</span>
<span class="p">}</span>
 
<span class="nx">sayHello</span>    <span class="c1">// a reference</span>
<span class="nx">sayHello</span><span class="p">()</span>  <span class="c1">// calling it</span>
 
<span class="o">--</span> <span class="nx">lua</span>
<span class="nx">local</span> <span class="kd">function</span> <span class="nx">sayHello</span><span class="p">()</span>
  <span class="nx">print</span><span class="p">(</span><span class="s2">"Hello, World!"</span><span class="p">);</span>
<span class="nx">end</span>
 
<span class="nx">sayHello</span>    <span class="o">--</span> <span class="nx">a</span> <span class="nx">reference</span>
<span class="nx">sayHello</span><span class="p">()</span>  <span class="o">--</span> <span class="nx">calling</span> <span class="nx">it</span></code></pre>

<p>Again, unlike Ruby, <code class="highlight">sayHello</code> won&#8217;t execute the function, while <code class="highlight">sayHello()</code> will. Let&#8217;s create an implementation of the <code class="highlight">time</code> method in JS and Lua.</p>

<pre><code class="highlight"><span class="c1">// javascript</span>
<span class="kd">var</span> <span class="nx">time</span> <span class="o">=</span> <span class="kd">function</span><span class="p">(</span><span class="nx">callback</span><span class="p">){</span>
  <span class="kd">var</span> <span class="nx">start</span> <span class="o">=</span> <span class="k">new</span> <span class="nb">Date</span><span class="p">();</span>
  <span class="nx">callback</span><span class="p">();</span>
  <span class="nx">alert</span><span class="p">(</span><span class="k">new</span> <span class="nb">Date</span><span class="p">.</span><span class="nx">getTime</span><span class="p">()</span> <span class="o">-</span> <span class="nx">start</span><span class="p">.</span><span class="nx">getTime</span><span class="p">());</span>
<span class="p">}</span>
 
<span class="nx">time</span><span class="p">(</span><span class="kd">function</span><span class="p">(){</span>
  <span class="c1">// run some code here..</span>
<span class="p">});</span>
 
<span class="o">--</span> <span class="nx">lua</span>
<span class="nx">local</span> <span class="kd">function</span> <span class="nx">time</span><span class="p">(</span><span class="nx">callback</span><span class="p">)</span>
  <span class="nx">local</span> <span class="nx">start</span> <span class="o">=</span> <span class="nx">os</span><span class="p">.</span><span class="nx">time</span><span class="p">();</span>
  <span class="nx">callback</span><span class="p">();</span>
  <span class="nx">print</span><span class="p">(</span><span class="nx">os</span><span class="p">.</span><span class="nx">time</span><span class="p">()</span> <span class="o">-</span> <span class="nx">start</span><span class="p">);</span>
<span class="nx">end</span>
 
<span class="nx">time</span><span class="p">(</span><span class="kd">function</span><span class="p">()</span>
  <span class="o">--</span> <span class="nx">run</span> <span class="nx">some</span> <span class="nx">code</span> <span class="nx">here</span><span class="p">..</span>
<span class="nx">end</span><span class="p">);</span></code></pre> 

<p>As you can see, you can pass an anonymous function definition directly to the two <code class="highlight">time</code> functions, as an argument &mdash; similar to the way you Ruby lets you pass procs as method arguments.</p>

<p>Just to elaborate, and as mentioned, you can pass a reference to a function as well as an actual function definition.</p>

<pre><code class="highlight">time(sayHello)</code></pre>

<p>And just to make sure you&#8217;re with me: <code class="highlight">time(sayHello())</code> will break miserably. <code class="highlight">sayHello</code> will execute before <code class="highlight">time</code>, which causes <code class="highlight">time</code> to use whatever executing <code class="highlight">sayHello</code> returns, instead of the function reference.</p>

<p>Lastly, a Ruby recap. In Ruby, <code class="highlight">foo</code> and <code class="highlight">foo()</code> are equivalents.</p> 

<pre><code class="highlight"><span class="k">def</span> <span class="nf">say_hello</span>
  <span class="nb">puts</span> <span class="s2">"Hello, World!"</span>
<span class="k">end</span>

<span class="n">say_hello</span>
<span class="c1"># =&gt; "Hello, World!"</span>
<span class="n">say_hello</span><span class="p">()</span>
<span class="c1"># =&gt; "Hello, World!"</span></code></pre>

<p>So, while other languages are able to pass around chunks of code by using references to other functions, Ruby doesn&#8217;t allow that. Ruby has a separate feature for this, though; procs and blocks.</p>

<h2>Relevant boring facts: Blocks to procs to blocks</h2>

<p>You can convert a block passed to a method into a proc by using special syntax for this.</p> 

<pre><code class="highlight"><span class="k">def</span> <span class="nf">time</span><span class="p">(</span><span class="o">&amp;</span><span class="n">block</span><span class="p">)</span>
  <span class="nb">puts</span> <span class="n">block</span>
<span class="k">end</span>

<span class="n">time</span>
<span class="c1"># =&gt; nil</span>
<span class="n">time</span> <span class="p">{</span> <span class="n">foo</span> <span class="p">}</span>
<span class="c1"># =&gt; #&lt;Proc:0x00029bbc&gt;</span></code></pre>

<p>You can <em>also</em> do this the other way around: pass a proc to a method and make it look as if you passed a block.</p> 

<pre><code class="highlight"><span class="k">def</span> <span class="nf">time</span>
  <span class="k">yield</span>
<span class="k">end</span>

<span class="n">my_proc</span> <span class="o">=</span> <span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span> <span class="nb">puts</span> <span class="s2">"I was called!"</span> <span class="p">}</span>
<span class="n">time</span><span class="p">(</span><span class="o">&amp;</span><span class="n">my_proc</span><span class="p">)</span>
<span class="c1"># =&gt; "I was called!"</span></code></pre>

<p>The ampersand is the key here, which tells Ruby that <code class="highlight">block</code> and <code class="highlight">my_proc</code> isn&#8217;t a method argument but a reference to the block passed to that method. Leave out the ampersand, and it&#8217;ll be treated as a regular method argument.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">time</span><span class="p">(</span><span class="n">block</span><span class="p">)</span>
  <span class="nb">puts</span> <span class="n">block</span>
<span class="k">end</span>

<span class="n">time</span> <span class="p">{</span> <span class="n">foo</span> <span class="p">}</span>
<span class="c1"># =&gt; ArgumentError: wrong number of arguments (0 for 1)</span>
<span class="c1"># Because the ampersand was left out in the method definition, the method now expects an</span>
<span class="c1"># argument, and it is given none (a block is not a method argument).</span>

<span class="k">def</span> <span class="nf">time</span>
  <span class="k">yield</span>
<span class="k">end</span>

<span class="n">time</span><span class="p">(</span><span class="n">my_proc</span><span class="p">)</span>
<span class="c1"># =&gt; ArgumentError: wrong number of arguments (1 for 0)</span>
<span class="c1"># Because the time method doesn't take any arguments, and without the ampersand, my_proc </span>
<span class="c1"># is passed as a regular method argument.</span></code></pre>

<h2>Block syntax</h2>

<p><code class="highlight">do ... end</code> and <code class="highlight">{ ... }</code> are equivalents. These two calls to <code class="highlight">time</code> are identical.</p>

<pre><code class="highlight"><span class="n">time</span> <span class="p">{</span> <span class="n">code_here</span> <span class="p">}</span>
  
<span class="n">time</span> <span class="k">do</span>
  <span class="n">code_here</span>
<span class="k">end</span></code></pre> 

<p>The ideom is to use <code class="highlight">do ... end</code> on multi-line blocks, and <code class="highlight">{ ... }</code> for one-liner blocks. It is entirely up to you, though. Following the ideom is recommended, but Ruby doesn&#8217;t enforce it.</p>

<h2>A note on lambdas</h2>

<p>Short answer: <code class="highlight">lambda { foo }</code> and <code class="highlight">proc { foo }</code> is essensially the same thing, you can use both interchangeable in your code.</p>

<p>There is two differences, though: One is how it handles <code class="highlight">return</code>. I suggest reading <a href="http://samdanielson.com/2007/3/19/proc-new-vs-lambda-in-ruby">this article</a>.</p>

<p>The other is how it handles arguments. This is really lame and strange. <code class="highlight">lambda</code> and <code class="highlight">proc</code> are equivalents, while <code class="highlight">Proc.new</code> differs. You&#8217;d think <code class="highlight">Proc.new</code> and <code class="highlight">proc</code> were equivalents, but they aren&#8217;t. I&#8217;ll let this code speak for itself.</p>

<pre><code class="highlight"><span class="n">a_lambda</span> <span class="o">=</span> <span class="nb">lambda</span> <span class="p">{</span><span class="o">|</span><span class="n">a</span><span class="o">|</span> <span class="n">a</span><span class="o">.</span><span class="n">inspect</span> <span class="p">}</span>
<span class="nb">puts</span> <span class="n">a_lambda</span><span class="o">.</span><span class="n">call</span>
<span class="c1"># =&gt; nil</span>
<span class="nb">puts</span> <span class="n">a_lambda</span><span class="o">.</span><span class="n">call</span><span class="p">(</span><span class="s2">"foo"</span><span class="p">,</span> <span class="mi">5</span><span class="p">)</span>
<span class="c1"># =&gt; ["foo", 5]</span>

<span class="n">sumlam</span> <span class="o">=</span> <span class="nb">lambda</span> <span class="p">{</span><span class="o">|</span><span class="n">a</span><span class="p">,</span> <span class="n">b</span><span class="o">|</span> <span class="n">a</span> <span class="o">+</span> <span class="n">b</span> <span class="p">}</span>
<span class="n">sumlam</span><span class="o">.</span><span class="n">call</span>
<span class="c1"># =&gt; ArgumentError: wrong number of arguments (0 for 2)</span>

<span class="n">sumproc</span> <span class="o">=</span> <span class="nb">proc</span> <span class="p">{</span><span class="o">|</span><span class="n">a</span><span class="p">,</span> <span class="n">b</span><span class="o">|</span> <span class="n">a</span> <span class="o">+</span> <span class="n">b</span> <span class="p">}</span>
<span class="n">sumproc</span><span class="o">.</span><span class="n">call</span>
<span class="c1"># =&gt; ArgumentError: wrong number of arguments (0 for 2)</span>
<span class="n">sumproc</span><span class="o">.</span><span class="n">call</span><span class="p">(</span><span class="mi">4</span><span class="p">,</span> <span class="mi">5</span><span class="p">)</span>
<span class="c1"># =&gt; 9</span>

<span class="n">orlyproc</span> <span class="o">=</span> <span class="no">Proc</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span><span class="o">|</span><span class="n">a</span><span class="p">,</span> <span class="n">b</span><span class="o">|</span> <span class="n">a</span> <span class="o">+</span> <span class="n">b</span> <span class="p">}</span>
<span class="n">orlyproc</span><span class="o">.</span><span class="n">call</span>
<span class="c1"># =&gt; NoMethodError: undefined method `+' for nil:NilClass</span>
<span class="n">orlyproc</span><span class="o">.</span><span class="n">call</span><span class="p">(</span><span class="mi">4</span><span class="p">,</span> <span class="mi">5</span><span class="p">)</span>
<span class="c1"># =&gt; 9</span></code></pre>
