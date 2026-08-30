---
title: "Styling Rails URLs"
date: "2009-06-14"
content_format: "html"
archive_order: 70
---
<p>This article explains how you can alter the looks of your URLs in a Rails friendly way. I assume that you know how to use <code class="highlight">map.resources</code> and named routes.</p>

<h2>Adding .html to all pages</h2>

<p><code class="highlight">ActionController</code> has a <code class="highlight">default_url_options</code> method that it uses for all <span class="caps">URL</span> generation tasks. It returns an empty hash by default, but can be overridden.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">ApplicationController</span> <span class="o">&lt;</span> <span class="no">ActionController</span><span class="o">::</span><span class="no">Base</span>
  <span class="k">def</span> <span class="nf">default_url_options</span><span class="p">(</span><span class="n">options</span> <span class="o">=</span> <span class="kp">nil</span><span class="p">)</span>
    <span class="p">{</span><span class="ss">:format</span> <span class="o">=&gt;</span> <span class="s2">"html"</span><span class="p">}</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Note that the options to your individual route calls gets predesence, <code class="highlight">posts_path(:format =&gt; "xml")</code> will append <tt>.xml</tt>, not <tt>.html</tt>.</p>

<h2>Custom route names</h2>

<p>For a projects controller&#8217;s show action, the default <span class="caps">URL</span> looks like this:</p>

<pre>/projects/5</pre>

<p>What if you want to localize it?</p>

<pre>/prosjekter/5</pre>

<p>One way is to name the controller &#8220;prosjekter&#8221; instead of &#8220;projects&#8221;. That isn&#8217;t very Rails friendly, though, you&#8217;ll end up fighting with pluralization conventions. Thankfully, there is a Rails friendly way to do this, via <tt>routes.rb</tt>.</p>

<pre><code class="highlight"><span class="n">map</span><span class="o">.</span><span class="n">resources</span> <span class="ss">:projects</span><span class="p">,</span> <span class="ss">:as</span> <span class="o">=&gt;</span> <span class="s2">"prosjekter"</span><span class="p">,</span> <span class="ss">:path_names</span> <span class="o">=&gt;</span> <span class="p">{</span><span class="ss">:new</span> <span class="o">=&gt;</span> <span class="s2">"nytt"</span><span class="p">,</span> <span class="ss">:edit</span> <span class="o">=&gt;</span> <span class="s2">"rediger"</span><span class="p">}</span></code></pre>

<p>That will give you these URLs:</p>

<pre>/prosjekter/5
/prosjekter/nytt
/prosjekter/5/rediger</pre>

<p>You can also set <code class="highlight">:path_names</code> globally, by adding the following to <tt>config/environment.rb</tt>.</p>

<pre><code class="highlight"><span class="n">config</span><span class="o">.</span><span class="n">action_controller</span><span class="o">.</span><span class="n">resources_path_names</span> <span class="o">=</span> <span class="p">{</span> <span class="ss">:new</span> <span class="o">=&gt;</span> <span class="s1">'ny'</span><span class="p">,</span> <span class="ss">:edit</span> <span class="o">=&gt;</span> <span class="s1">'rediger'</span> <span class="p">}</span></code></pre>

<h2>URLs without the ID of the record</h2>

<p>Normaly, Rails URLs look like this:</p>

<pre>/posts/5
/projects/239
/users/39/favorites/2</pre>

<p>Perhaps you want more descriptive URLs, though, such as having the title of the post in the <span class="caps">URL</span> instead of just the ID. Here are a few altervatives.</p>

<h2>The easy way with compromises</h2>

<pre>/posts/5-a-post-about-rockets
/projects/239-new-website
/users/39-augustl/favorites/2-that-book</pre>

<p>The compromise is that the ID still is in the <span class="caps">URL</span>. It is unlikely that a visible ID is a problem, but if it for some reason is, you can learn how to do it without the ID in the next section.</p>

<p>What makes Rails use the ID alone in the first place? The answer is <code class="highlight">to_param</code>. It&#8217;s an instance method in all models, and it looks like this:</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">to_param</span>
  <span class="nb">id</span>
<span class="k">end</span></code></pre>

<p>We can override it to include the title of the post as well as the ID.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Post</span> <span class="o">&lt;</span> <span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="k">def</span> <span class="nf">to_param</span>
    <span class="s2">"</span><span class="si">#{</span><span class="nb">id</span><span class="si">}</span><span class="s2">-</span><span class="si">#{</span><span class="n">title</span><span class="o">.</span><span class="n">parameterize</span><span class="si">}</span><span class="s2">"</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Rails will now use the id, a dash, and and <span class="caps">URL</span> friendly version of the title. We need to make it <span class="caps">URL</span> friendly with <code class="highlight">parameterize</code>, so that <code class="highlight">"Foo and bar!"</code> turns into <code class="highlight">"foo-and-bar"</code>. If we don&#8217;t, we&#8217;ll get invalid URLs, and browsers will blow up.</p>

<p>The reason this is the easy way, is that this is all there is to it. Our finds will still work, because of the way Ruby handles <code class="highlight">to_i</code> on strings.</p>

<pre><code class="highlight"><span class="s2">"5-a-post-about-rockets"</span><span class="o">.</span><span class="n">to_i</span>
<span class="c1"># =&gt; 5</span></code></pre>

<p>The <code class="highlight">find</code> method that we use in the controllers calls <code class="highlight">to_i</code> for us.</p>

<pre><code class="highlight"><span class="no">Post</span><span class="o">.</span><span class="n">find</span><span class="p">(</span><span class="s2">"5-a-post-about-rockets"</span><span class="p">)</span>
<span class="c1"># equals</span>
<span class="no">Post</span><span class="o">.</span><span class="n">find</span><span class="p">(</span><span class="mi">5</span><span class="p">)</span></code></pre>

<h2>The hard way</h2>

<pre>/posts/a-post-about-rockets
/projects/new-website
/users/augustl/favorites-that-book</pre>

<p>Because the ID is no longer in the <span class="caps">URL</span>, we have to change the code a bit.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">Post</span> <span class="o">&lt;</span> <span class="no">ActiveRecord</span><span class="o">::</span><span class="no">Base</span>
  <span class="n">before_create</span> <span class="ss">:create_slug</span>
  
  <span class="k">def</span> <span class="nf">to_param</span>
    <span class="n">slug</span>
  <span class="k">end</span>
    
  <span class="k">def</span> <span class="nf">create_slug</span>
    <span class="nb">self</span><span class="o">.</span><span class="n">slug</span> <span class="o">=</span> <span class="nb">self</span><span class="o">.</span><span class="n">title</span><span class="o">.</span><span class="n">parameterize</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>When a post is created, the <span class="caps">URL</span> friendly version of the title is stored in the database, in the <tt>slug</tt> column. We also have to update the finds to find records using the slug column instead of using the ID.</p>

<pre><code class="highlight"><span class="k">class</span> <span class="nc">ProjectsController</span> <span class="o">&lt;</span> <span class="no">ApplicationController</span>
  <span class="k">def</span> <span class="nf">show</span>
    <span class="vi">@project</span> <span class="o">=</span> <span class="no">Project</span><span class="o">.</span><span class="n">find_by_slug!</span><span class="p">(</span><span class="n">params</span><span class="o">[</span><span class="ss">:id</span><span class="o">]</span><span class="p">)</span>
  <span class="k">end</span>
<span class="k">end</span></code></pre>

<p>Apply the same tactic to all relevant finds, and you&#8217;re good to go.</p>

<h2>No controller names</h2>

<p>Instead of <code class="highlight">/users/augustl/projects/a-project</code>, you might prefer this:</p>

<pre>/augustl/a-project
/some-user/another-project</pre>

<p>Just a heads up: Most people don&#8217;t care about how the URLs looks. In my opinion, it only makes sense to do this kind of routing if your users are typing in the URLs by hand, or if the <span class="caps">URL</span> is commonly linked to. Github projects is a good example of sensible use of short URLs. If not, I advise you to leave the controller names in there.</p>

<p>Anyhow, here&#8217;s how you do it:</p>

<pre><code class="highlight"><span class="n">map</span><span class="o">.</span><span class="n">short_user</span> <span class="s2">":id"</span><span class="p">,</span> <span class="ss">:controller</span> <span class="o">=&gt;</span> <span class="s2">"users"</span><span class="p">,</span> <span class="ss">:action</span> <span class="o">=&gt;</span> <span class="s2">"show"</span>
<span class="n">map</span><span class="o">.</span><span class="n">short_project</span> <span class="s2">":user_id/:id"</span><span class="p">,</span> <span class="ss">:controller</span> <span class="o">=&gt;</span> <span class="s2">"projects"</span><span class="p">,</span> <span class="ss">:action</span> <span class="o">=&gt;</span> <span class="s2">"show"</span></code></pre>

<p>This gives you two very handy named routes.</p>

<pre><code class="highlight"><span class="n">short_user_path</span><span class="p">(</span><span class="vi">@user</span><span class="p">)</span>
<span class="n">short_project_path</span><span class="p">(</span><span class="vi">@user</span><span class="p">,</span> <span class="vi">@project</span><span class="p">)</span></code></pre>

<p>The example above only handles those two show actions. I advise using regular <code class="highlight">map.resources</code> for <code class="highlight">create</code>, <code class="highlight">edit</code> etc. Users will never have to <em>link</em> to the <span class="caps">URL</span> that creates a new project, so it&#8217;s pointless to style those routes.</p>
