---
title: "Dynamic session expiration time in Rails 3"
date: "2010-01-16"
content_format: "html"
---
<h2>Update: new syntax</h2>

<pre><code class="highlight"><span class="n">cookies</span><span class="o">[</span><span class="ss">:thing</span><span class="o">]</span> <span class="o">=</span> <span class="p">{</span><span class="ss">:value</span> <span class="o">=&gt;</span> <span class="p">{</span><span class="ss">:normal</span> <span class="o">=&gt;</span> <span class="s2">"session stuff"</span><span class="p">},</span> <span class="ss">:expires</span> <span class="o">=&gt;</span> <span class="mi">2</span><span class="o">.</span><span class="n">hours</span><span class="o">.</span><span class="n">from_now</span><span class="p">}</span>

<span class="c1"># Signed cookies are encrypted with the apps secret_token.</span>
<span class="n">cookies</span><span class="o">.</span><span class="n">signed</span><span class="o">[</span><span class="ss">:login</span><span class="o">]</span> <span class="o">=</span> <span class="p">{</span><span class="ss">:value</span> <span class="o">=&gt;</span> <span class="vi">@user</span><span class="o">.</span><span class="n">id</span><span class="p">,</span> <span class="ss">:expires</span> <span class="o">=&gt;</span> <span class="mi">1</span><span class="o">.</span><span class="n">day</span><span class="o">.</span><span class="n">from_now</span><span class="p">}</span>

<span class="c1"># These calls are equivalent.</span>
<span class="n">cookies</span><span class="o">[</span><span class="ss">:foo</span><span class="o">]</span> <span class="o">=</span> <span class="p">{</span><span class="ss">:value</span> <span class="o">=&gt;</span> <span class="s2">"bar"</span><span class="p">,</span> <span class="ss">:expires</span> <span class="o">=&gt;</span> <span class="mi">20</span><span class="o">.</span><span class="n">years</span><span class="o">.</span><span class="n">from_now</span><span class="p">}</span>
<span class="n">cookies</span><span class="o">.</span><span class="n">permanent</span><span class="o">[</span><span class="ss">:foo</span><span class="o">]</span> <span class="o">=</span> <span class="s2">"bar"</span></code></pre>

<p>Following is the outdated and obsolete original version of this post.</p>

<div class="obsolete">

<p>I created a <a href="http://github.com/augustl/session-persistence">plugin for remember me checkboxes in Rails 3</a>. This post explains how the plugin works.</p>

<h2>Remember me</h2>

<p>Dynamic session expiration is a fancy name for &#8220;Remember me&#8221; checkboxes on login forms. When unchecked, the session resets when the browser is closed. When checked, the session will last for a given time period (30 minutes, 2 weeks, 1 year, whatever), and when the user visits your site, the countdown resets.</p>

<p>This is how you set coookie expiration time in Rails 3:</p>

<pre><code class="highlight"><span class="n">env</span><span class="o">[</span><span class="s2">"rack.session.options"</span><span class="o">][</span><span class="ss">:expire_after</span><span class="o">]</span> <span class="o">=</span> <span class="mi">10</span><span class="o">.</span><span class="n">minutes</span></code></pre>

<p>This alone won&#8217;t do, though.</p>

<h2>Cookie limitations</h2>
<p>Setting <code class="highlight">:expire_after</code> will set the <code class="highlight">expires</code> attribute on the cookie. This causes the cookie to persist to the given date even when the browser is closed, while a normal cookie without <code class="highlight">expires</code> will last as long as the browser is open.</p>

<p>Here&#8217;s our problem: When we change something in the <code class="highlight">session</code> of our Rails app, the cookie needs to be updated. This is done by creating a entirely new cookie to replace the old one. The reason this is a problem is, <a href="http://stackoverflow.com/questions/2076792">as I learned recently</a>, that browsers will only send the raw cookie data to our Rails app, leaving out the meta data such as the <code class="highlight">expires</code> of the cookie.</p>

<p>In other words, when we change something in our <code class="highlight">session</code>, we lose track of when the cookie was supposed to expire. There is no way for Rails to know what the original <code class="highlight">expires</code> was, since the browser doesn&#8217;t send that information to our Rails app.</p>

<h2>Workaround</h2>

<p>The simple answer is to use <a href="http://github.com/augustl/session-persistence">my plugin</a>. Here&#8217;s what my plugin does, under the hood.</p>

<p>When we log in, we set the expiration time in our session.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">create</span>
  <span class="n">session</span><span class="o">[</span><span class="ss">:remember_for</span><span class="o">]</span> <span class="o">=</span> <span class="mi">1</span><span class="o">.</span><span class="n">week</span>
  <span class="c1"># Perform regular login..</span>
<span class="k">end</span></code></pre>

<p>In our application controller, we create an after filter that will pass this session variable to our new cookie.</p>

<pre><code class="highlight"><span class="n">after_filter</span> <span class="ss">:persist_session</span>
 
<span class="k">def</span> <span class="nf">persist_session</span>
  <span class="k">if</span> <span class="n">session</span><span class="o">[</span><span class="ss">:remember_for</span><span class="o">]</span>
    <span class="n">env</span><span class="o">[</span><span class="s2">"rack.session.options"</span><span class="o">][</span><span class="ss">:expire_after</span><span class="o">]</span> <span class="o">=</span> <span class="n">session</span><span class="o">[</span><span class="ss">:remember_for</span><span class="o">]</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>When we want to log out, just have to delete the session key, and the session will return to normal.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">destroy</span>
  <span class="n">session</span><span class="o">.</span><span class="n">delete</span><span class="p">(</span><span class="ss">:remember_for</span><span class="p">)</span>
<span class="k">end</span></code></pre>

<p>The after filter in the application controller will run before Rails creates the new cookie. This means that out <code class="highlight">:remember_for</code> from the old cookie will get passed on to the new cookie before it is replaced.</p>

<p>Win!</p>

<h2>Full example, using the plugin</h2>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">SessionsController</span> <span class="o">&lt;</span> <span class="no">ApplicationController</span>
  <span class="k">def</span> <span class="nf">create</span>
    <span class="n">session_expires_after</span> <span class="o">=</span> <span class="mi">1</span><span class="o">.</span><span class="n">day</span> <span class="k">if</span> <span class="n">params</span><span class="o">[</span><span class="ss">:remember_me</span><span class="o">]</span>
    
    <span class="n">user</span> <span class="o">=</span> <span class="no">User</span><span class="o">.</span><span class="n">authenticate</span><span class="p">(</span><span class="n">params</span><span class="o">[</span><span class="ss">:username</span><span class="o">]</span><span class="p">,</span> <span class="n">params</span><span class="o">[</span><span class="ss">:password</span><span class="o">]</span><span class="p">)</span>
    <span class="k">if</span> <span class="n">user</span>
      <span class="n">session</span><span class="o">[</span><span class="ss">:user_id</span><span class="o">]</span> <span class="o">=</span> <span class="n">user</span><span class="o">.</span><span class="n">id</span>
      <span class="c1"># redirect_to ...</span>
    <span class="k">else</span>
      <span class="c1"># ...</span>
    <span class="k">end</span>
  <span class="k">end</span>

  <span class="k">def</span> <span class="nf">destroy</span>
     <span class="n">session_expires_now</span> <span class="c1"># unsets the session key</span>
     <span class="n">session</span><span class="o">.</span><span class="n">delete</span><span class="p">(</span><span class="ss">:user_id</span><span class="p">)</span>
     <span class="c1"># redirect_to ...</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>
</div>
