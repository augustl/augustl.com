---
title: "iOS and Objective-C block quickref"
date: "2010-12-08"
content_format: "html"
---
<p>This is a reference/cheat sheet of Objective-C blocks, introduced in iOS 4.0 and OS X Snow Leopard.</p>

<p>I keep forgetting the syntax, especially for writing methods that takes blocks. I hope you'll find this quickref useful, I certainly will.</p>


<h2>Passing blocks</h2>

<pre><code class="highlight"><span class="c1">// The very simplest case.</span>
<span class="p">[</span><span class="n">foo</span> <span class="nl">someMethod</span><span class="p">:</span><span class="o">^</span><span class="p">{</span>
    <span class="c1">// Any code here.  </span>
<span class="p">}];</span>

<span class="c1">// A block that takes arguments.</span>
<span class="p">[</span><span class="n">foo</span> <span class="nl">someMethod</span><span class="p">:</span><span class="o">^</span><span class="p">(</span><span class="bp">NSString</span> <span class="o">*</span><span class="n">something</span><span class="p">,</span> <span class="kt">BOOL</span> <span class="n">somethingElse</span><span class="p">)</span> <span class="p">{</span>
    <span class="c1">// something an somethingElse can be used just like function arguments.</span>
<span class="p">}];</span></code></pre>

<h2>Taking blocks</h2>

<pre><code class="highlight"><span class="c1">// Take a block with no arguments</span>
<span class="p">-</span> <span class="p">(</span><span class="kt">void</span><span class="p">)</span><span class="nf">someMethod:</span><span class="p">(</span><span class="kt">void</span><span class="p">(</span><span class="o">^</span><span class="p">)())</span><span class="nv">block</span><span class="p">;</span>

<span class="c1">// Take a block with arguments</span>
<span class="p">-</span> <span class="p">(</span><span class="kt">void</span><span class="p">)</span><span class="nf">someMethod:</span><span class="p">(</span><span class="kt">void</span><span class="p">(</span><span class="o">^</span><span class="p">)(</span><span class="bp">NSString</span> <span class="o">*</span><span class="n">test</span><span class="p">,</span> <span class="kt">id</span> <span class="n">anyObject</span><span class="p">))</span><span class="nv">block</span><span class="p">;</span>

<span class="c1">// Any return type is OK.</span>
<span class="p">-</span> <span class="p">(</span><span class="kt">void</span><span class="p">)</span><span class="nf">someMethod:</span><span class="p">(</span><span class="kt">BOOL</span><span class="p">(</span><span class="o">^</span><span class="p">)())</span><span class="nv">block</span><span class="p">;</span>
<span class="p">-</span> <span class="p">(</span><span class="kt">void</span><span class="p">)</span><span class="nf">someMethod:</span><span class="p">(</span><span class="n">NSRange</span> <span class="o">*</span><span class="p">(</span><span class="o">^</span><span class="p">)())</span><span class="nv">block</span><span class="p">;</span>

<span class="c1">// Call a block</span>
<span class="p">-</span> <span class="p">(</span><span class="kt">void</span><span class="p">)</span><span class="nf">someMethod:</span><span class="p">(</span><span class="kt">void</span><span class="p">(</span><span class="o">^</span><span class="p">)(</span><span class="bp">NSString</span> <span class="o">*</span><span class="n">test</span><span class="p">))</span><span class="nv">block</span> <span class="p">{</span>
    <span class="n">block</span><span class="p">(</span><span class="s">@"Yep"</span><span class="p">);</span>
<span class="p">}</span></code></pre>

<p>The syntax can be described as:</p>

<pre><code class="highlight">a(^)(b);
a = Return type
b = Arguments</code></pre>

<h2>DRY block signatures</h2>

<p>You can create a type for your block signature, if you're using the same signature many places.

<pre><code class="highlight"><span class="k">typedef</span> <span class="nf">BOOL</span> <span class="p">(</span><span class="o">^</span><span class="n">MyCustomBlock</span><span class="p">)(</span><span class="bp">NSString</span> <span class="o">*</span><span class="n">something</span><span class="p">);</span>

<span class="p">-</span> <span class="p">(</span><span class="kt">void</span><span class="p">)</span><span class="nf">myMethod:</span><span class="p">(</span><span class="n">MyCustomBlock</span><span class="p">)</span><span class="nv">block</span> <span class="p">{</span>
    <span class="kt">BOOL</span> <span class="n">result</span> <span class="o">=</span> <span class="n">block</span><span class="p">(</span><span class="s">@"whatever"</span><span class="p">);</span>
<span class="p">}</span>

<span class="p">[</span><span class="n">foo</span> <span class="nl">myMethod</span><span class="p">:</span><span class="o">^</span><span class="p">(</span><span class="bp">NSString</span> <span class="o">*</span><span class="n">string</span><span class="p">){</span>
    <span class="k">return</span> <span class="p">[</span><span class="n">string</span> <span class="nl">isEqualToString</span><span class="p">:</span><span class="s">@"give you up"</span><span class="p">]</span>
<span class="p">}];</span></code></pre>

<h2>Inferring return type</h2>

<p>The compiler will infer the return type of a block for unspecified return types, making return type specification optional. In the examples above, we have never specified the return type. This is how block creation looks with an explicit return type.</p>

<pre><code class="highlight"><span class="p">[</span><span class="n">foo</span> <span class="nl">someMethod</span><span class="p">:</span><span class="kt">BOOL</span><span class="o">^</span><span class="p">{</span> <span class="k">return</span> <span class="nb">YES</span><span class="p">;</span> <span class="p">}];</span>

<span class="c1">// Inferred return type, for good measure.</span>
<span class="p">[</span><span class="n">foo</span> <span class="nl">someMethod</span><span class="p">:</span><span class="o">^</span><span class="p">{</span> <span class="k">return</span> <span class="nb">YES</span><span class="p">;</span> <span class="p">}];</span></code></pre>

<h2>Using blocks returned from methods</h2>

<p>This actually have a use case; storing blocks in a <code class="highlight">NSArray</code> or similar.</p>

<pre><code class="highlight"><span class="c1">// Assuming "callbacks" is an NSMutableArray instance variable.</span>
<span class="p">-</span> <span class="p">(</span><span class="kt">void</span><span class="p">)</span><span class="nf">registerCallback:</span><span class="p">(</span><span class="kt">BOOL</span><span class="p">(</span><span class="o">^</span><span class="p">)())</span><span class="nv">callback</span> <span class="p">{</span>
    <span class="p">[</span><span class="n">_listeners</span> <span class="nl">addObject</span><span class="p">:[[</span><span class="n">callback</span> <span class="k">copy</span><span class="p">]</span> <span class="n">autorelease</span><span class="p">]];</span>
<span class="p">}</span>

<span class="p">-</span> <span class="p">(</span><span class="kt">void</span><span class="p">)</span><span class="nf">runCallbacks</span> <span class="p">{</span>
    <span class="kt">int</span> <span class="n">i</span> <span class="o">=</span> <span class="p">[</span><span class="n">_listeners</span> <span class="n">count</span><span class="p">];</span>
    <span class="k">while</span> <span class="p">(</span><span class="n">i</span><span class="o">--</span><span class="p">)</span> <span class="p">{</span>
        <span class="kt">BOOL</span> <span class="p">(</span><span class="o">^</span><span class="n">block</span><span class="p">)()</span> <span class="o">=</span> <span class="p">[</span><span class="n">_listeners</span> <span class="nl">objectAtIndex</span><span class="p">:</span><span class="n">i</span><span class="p">];</span>
        <span class="kt">BOOL</span> <span class="n">state</span> <span class="o">=</span> <span class="n">block</span><span class="p">();</span>
        <span class="c1">// And so on...</span>
    <span class="p">}</span>
<span class="p">}</span></code></pre>

<p>As we can see, the return type isn't inferrable in this case.</p>

<p>The reason for copying the block in <code class="highlight">registerCallback:</code> is that the block can be (and most likely is) on the stack when we get it. Copying it moves it to the heap.</p>

<h2>Recommended reads</h2>

<ul>
  <li><a href="http://thirdcog.eu/pwcblocks/">Joachim Bengtsson's awesome reference</a>, you should read it from cover to cover.</li>
  <li><a href="http://cocoawithlove.com/2009/10/how-blocks-are-implemented-and.html">Cocoa with Love on how blocks are implemented</a>.</li>
  <li><a href="http://pragmaticstudio.com/blog/2010/9/15/ios4-blocks-2">Blocks design patterns</a>, article by Pragmatic Programmers.</li>
</ul>
