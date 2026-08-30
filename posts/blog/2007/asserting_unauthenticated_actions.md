---
title: "Asserting unauthenticated actions"
date: "2007-11-28"
content_format: "html"
archive_order: 94
---
<p>Using <code class="highlight">assert_unauthenticated</code> to test that your <code class="highlight"><span class="n">before_filter</span> <span class="ss">:require_login</span></code> thingie works.</p>
 
<p>I&#8217;m not a part of the RSpec mob. It&#8217;s simply not appealing to me, good ol&#8217; <code class="highlight"><span class="s2">"test/unit"</span></code> is my friend. And with these recent updates on the way <a href="http://railscasts.com/episodes/81">fixtures works in 2.0</a>, mocking is a bit less cool, too.</p>

<p>(I might be wrong about that mocking thought of mine, though, I&#8217;ve never mocked because I didn&#8217;t see the point of mocking, either. No mocking, no RSpec, what kind of person am I?)</p>

<p>So, I&#8217;m using <code class="highlight"><span class="s2">"test/unit"</span></code>, and I wrote a method to assert that action x and y requires login.</p>
 
<pre><code class="highlight"><span class="k">def</span> <span class="nf">test_should_block_unauthenticated</span>
  <span class="n">assert_unauthenticated</span> <span class="ss">:get</span> <span class="o">=&gt;</span> <span class="o">[</span><span class="ss">:new</span><span class="p">,</span> <span class="ss">:edit</span><span class="o">]</span><span class="p">,</span> 
    <span class="ss">:post</span> <span class="o">=&gt;</span>  <span class="o">[</span><span class="ss">:create</span><span class="p">,</span> <span class="ss">:update</span><span class="o">]</span>
<span class="k">end</span></code></pre>
  
<p>Here&#8217;s the implementation (in the <tt>test_helper.rb</tt>):</p> 
 
 
<pre><code class="highlight"><span class="k">def</span> <span class="nf">assert_unauthenticated</span><span class="p">(</span><span class="n">requests</span> <span class="o">=</span> <span class="p">{})</span>
  <span class="n">requests</span><span class="o">.</span><span class="n">each</span> <span class="k">do</span> <span class="o">|</span><span class="n">type</span><span class="p">,</span> <span class="nb">methods</span><span class="o">|</span>
    <span class="nb">methods</span><span class="o">.</span><span class="n">each</span> <span class="k">do</span> <span class="o">|</span><span class="nb">method</span><span class="o">|</span>
      <span class="n">perform_unauthenticated_assert</span><span class="p">(</span><span class="n">type</span><span class="p">,</span> <span class="nb">method</span><span class="p">)</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="k">def</span> <span class="nf">perform_unauthenticated_assert</span><span class="p">(</span><span class="n">type</span><span class="p">,</span> <span class="nb">method</span><span class="p">)</span>
  <span class="c1"># Call the method (e.g. perform the request)</span>
  <span class="nb">self</span><span class="o">.</span><span class="n">send</span><span class="p">(</span><span class="n">type</span><span class="p">,</span> <span class="nb">method</span><span class="p">)</span>

  <span class="c1"># Do the assert</span>
  <span class="n">assert_block</span> <span class="s2">"Requesting </span><span class="si">#{</span><span class="nb">method</span><span class="si">}</span><span class="s2"> with </span><span class="si">#{</span><span class="n">type</span><span class="si">}</span><span class="s2"> succeeded without login"</span> <span class="k">do</span>
    <span class="k">begin</span>
      <span class="n">assert</span> <span class="o">!</span><span class="vi">@controller</span><span class="o">.</span><span class="n">current_user</span>
      <span class="n">assert_redirected_to</span> <span class="n">login_url</span>
    <span class="k">rescue</span>
      <span class="kp">false</span>
    <span class="k">end</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>
 
<p>Change the assertions inside the <code class="highlight">assert_block</code> call to whatever you need to assert.</p> 

<p>And yes, please mail any suggestions on how to get rid of all the silly <code class="highlight">each</code>-ing to augustlilleaas at google mail dot com.</p>
