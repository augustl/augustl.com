---
title: "Creating your own validations"
date: "2009-07-03"
content_format: "html"
---
<p>There are many different methods for creating your own, custom validations in Rails. Here&#8217;s some of them:</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Post</span> <span class="o">&lt;</span> <span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="n">validate</span> <span class="ss">:my_custom_validation</span><span class="p">,</span> <span class="ss">:on</span> <span class="o">=&gt;</span> <span class="ss">:create</span>
  
  <span class="n">validate</span> <span class="k">do</span> <span class="o">|</span><span class="n">record</span><span class="o">|</span>
    <span class="n">record</span><span class="o">.</span><span class="n">errors</span><span class="o">.</span><span class="n">add_to_base</span><span class="p">(</span><span class="s2">"This sucks."</span><span class="p">)</span> <span class="k">if</span> <span class="n">record</span><span class="o">.</span><span class="n">ponies?</span>
  <span class="k">end</span>
  
  <span class="k">def</span> <span class="nf">ponies?</span>
    <span class="kp">false</span> <span class="c1"># do something real here.</span>
  <span class="k">end</span>
  
  <span class="kp">private</span>
  
  <span class="k">def</span> <span class="nf">my_custom_validation</span>
    <span class="n">errors</span><span class="o">.</span><span class="n">add</span><span class="o">.</span><span class="n">to_base</span><span class="p">(</span><span class="s2">"I refuse to be saved!"</span><span class="p">)</span> <span class="k">if</span> <span class="n">my_condition?</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<h2>validates_each</h2>

<p>You can use <code class="highlight">validates_each</code> to run the same validation code on multiple attributes.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">User</span> <span class="o">&lt;</span> <span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="n">validates_each</span><span class="p">(</span><span class="ss">:home_email</span><span class="p">,</span> <span class="ss">:job_email</span><span class="p">)</span> <span class="k">do</span> <span class="o">|</span><span class="n">record</span><span class="p">,</span> <span class="n">attribute</span><span class="p">,</span> <span class="n">value</span><span class="o">|</span>
    <span class="k">if</span> <span class="n">value</span> <span class="o">!~</span> <span class="sr">/my fancy email regexp/</span>
      <span class="n">record</span><span class="o">.</span><span class="n">errors</span><span class="o">.</span><span class="n">add</span><span class="p">(</span><span class="n">attribute</span><span class="p">,</span> <span class="s2">"My error message!"</span><span class="p">)</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<h2>Custom validates_foo methods</h2>

<p>In Rails&#8217; internals, <code class="highlight">validates_each</code> is used in all the validation methods. <code class="highlight">validates_each</code> will handle generic options such as <code class="highlight">:on =&gt; :create</code>, <code class="highlight">:if =&gt; proc { ... }</code>, and so on.</p>

<pre><code class="highlight"><span class="c1"># lib/validates_email.rb</span>
<span class="k">class</span> <span class="nc">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="k">def</span> <span class="nc">self</span><span class="o">.</span><span class="nf">validates_email</span><span class="p">(</span><span class="o">*</span><span class="n">args</span><span class="p">)</span>
    <span class="n">validates_each</span><span class="p">(</span><span class="o">*</span><span class="n">args</span><span class="p">)</span> <span class="k">do</span> <span class="o">|</span><span class="n">record</span><span class="p">,</span> <span class="n">attribute</span><span class="p">,</span> <span class="n">value</span><span class="o">|</span>
      <span class="k">if</span> <span class="n">value</span> <span class="o">!~</span> <span class="sr">/my fancy email regexp/</span>
        <span class="n">record</span><span class="o">.</span><span class="n">errors</span><span class="o">.</span><span class="n">add</span><span class="p">(</span><span class="n">attribute</span><span class="p">,</span> <span class="s2">"is not a valid e-mail address"</span><span class="p">)</span>
      <span class="k">end</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span>
 
<span class="c1"># config/initializers/[anything].rb</span>
<span class="nb">require</span> <span class="s2">"validates_email"</span></code></pre>

<p>This code provides a <code class="highlight">validates_email</code> method you can use in your model, alongside <code class="highlight">validates_length_of</code> and friends.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Contact</span> <span class="o">&lt;</span> <span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="n">validates_email</span> <span class="ss">:home_email</span><span class="p">,</span> <span class="ss">:work_email</span><span class="p">,</span> <span class="ss">:on</span> <span class="o">=&gt;</span> <span class="ss">:create</span>
<span class="k">end</span></code></pre>
