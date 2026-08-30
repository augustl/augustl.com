---
title: "Classes and constants magic"
date: "2008-09-01"
content_format: "html"
archive_order: 81
---
<p>An anonymous class!</p>

<pre><code class="highlight"><span class="n">bear</span> <span class="o">=</span> <span class="no">Class</span><span class="o">.</span><span class="n">new</span>

<span class="nb">puts</span> <span class="n">bear</span>
<span class="c1"># =&gt; #&lt;Class:0x8ef08&gt;</span>

<span class="nb">puts</span> <span class="n">bear</span><span class="o">.</span><span class="n">class</span>
<span class="c1"># =&gt; Class</span>

<span class="nb">puts</span> <span class="n">bear</span><span class="o">.</span><span class="n">name</span>
<span class="c1"># =&gt; ""</span></code></pre>

<p>This class has no name, it's anonymous. Let's create an instance of the anonymous class.</p>


<pre><code class="highlight"><span class="n">b</span> <span class="o">=</span> <span class="n">bear</span><span class="o">.</span><span class="n">new</span>
<span class="nb">puts</span> <span class="n">b</span><span class="o">.</span><span class="n">class</span>
<span class="c1">#=&gt; #&lt;Class:0x8ef08&gt;</span></code></pre>

<p>Normally, <code class="highlight">b.class</code> would return the class name. Anonymous means no name. Ruby returns an instance of class (the one created with <code class="highlight">Class.new</code>) insntead.</p>

<p>A class name is always a constant. The call <code class="highlight">class Foo; end</code> tells Ruby to create an instance of <code class="highlight">Class</code> and assign that instance to the constant <code class="highlight">Foo</code>. These two calls are equal:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Foo</span><span class="p">;</span> <span class="k">end</span>
<span class="no">Foo</span> <span class="o">=</span> <span class="no">Class</span><span class="o">.</span><span class="n">new</span></code></pre>

<p>Let's try this with our anonymous class. We're assigning the instance of <code class="highlight">Class</code> stored in the variable <code class="highlight">bear</code> to a constant, <code class="highlight">Bear</code>.</p>

<pre><code class="highlight"><span class="no">Bear</span> <span class="o">=</span> <span class="n">bear</span>

<span class="nb">puts</span> <span class="n">b</span><span class="o">.</span><span class="n">class</span>
<span class="c1"># =&gt; Bear</span>

<span class="nb">puts</span> <span class="n">b</span><span class="o">.</span><span class="n">name</span>
<span class="c1"># =&gt; "Bear"</span></code></pre>

<p>It now reports <code class="highlight">Bear</code> as the class name, because it's no longer anonymous.</p>

<p>Our instance of <code class="highlight">Class</code> seems to have vanished, but it's still possible to access this instance directly.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="o">&lt;&lt;</span> <span class="no">Bear</span>
  <span class="nb">puts</span> <span class="nb">self</span>
  <span class="c1"># =&gt; #&lt;Class:Bear&gt;</span>
<span class="k">end</span></code></pre>

<p>It couldn't hide from us after all. The special (<code class="highlight">class &lt;&lt;</code>) syntax lets us access it. It also says <code class="highlight">Bear</code> rather than <code class="highlight">0x8ef08</code>, to let us know that this class is no longer anonymous.</p>

<p>This secret and hidden instance of <code class="highlight">Class</code> is what rubyists refers to as the _metaclass_ of a class. <code class="highlight">#&lt;Class:Bear&gt;</code> is the metaclass of <code class="highlight">Bear</code>.</p>

<p>It's this metaclass that holds all the class methods. That makes sense, because a constant can't have methods. Instances is the only thing in Ruby that has methods.</p>

<p>Important summary: Class methods of a class are simply instance methods of its metaclass. Read this out loud 10 times.</p>

<h2>Code speaks louder than words</h2>

<pre><code class="highlight"><span class="no">Bear</span><span class="o">.</span><span class="n">class_eval</span> <span class="k">do</span>
  <span class="k">def</span> <span class="nf">say_hello</span>
    <span class="nb">puts</span> <span class="s2">"Hello!"</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="no">Bear</span><span class="o">.</span><span class="n">say_hello</span>
<span class="c1"># =&gt; NoMethodError: undefined method ‘say_hello’ for Bear:Class</span></code></pre>

<p>We need to define the method on the metaclass, the instance of <code class="highlight">Class</code>.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="o">&lt;&lt;</span> <span class="no">Bear</span>
  <span class="k">def</span> <span class="nf">say_hello</span>
    <span class="nb">puts</span> <span class="s2">"Hello!"</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="no">Bear</span><span class="o">.</span><span class="n">say_hello</span>
<span class="c1"># =&gt; "Hello!"</span></code></pre>

<h2>Further reading</h2>

<p>_why the lucky stiff has <a href="http://whytheluckystiff.net/articles/seeingMetaclassesClearly.html">more on the subject</a>.</p>
