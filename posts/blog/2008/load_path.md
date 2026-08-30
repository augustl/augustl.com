---
title: "Load path"
date: "2008-12-28"
content_format: "html"
---
<p>When you <code class="highlight">require</code> something, Ruby looks for a matching file in all the directories in the load path. The load path is stored in the global variable <code class="highlight">$LOAD_PATH</code>.</p>

<p>Consider the following directory structure:</p>

<pre>top_level.rb
underlings/
  slave.rb
  equal.rb</pre>

<p>You&#8217;ll get an error if you try to <code class="highlight">require "slave"</code> from <tt>top_level.rb</tt>. When you <code class="highlight">require</code> something, Ruby looks for a matching file in the directories of the <code class="highlight">$LOAD_PATH</code>. The directory <tt>underlings/</tt> is not automatically added to the <code class="highlight">$LOAD_PATH</code> by Ruby, so the <code class="highlight">require</code> fails.</p>

<p>If you on the other hand add <tt>underlings/</tt> to the <code class="highlight">$LOAD_PATH</code>, it will work. Adding directories to the load path is easy.</p>

<pre><code class="highlight"># top_level.rb
$LOAD_PATH &lt;&lt; File.join(File.dirname(__FILE__), "underlings")
require "slave"</code></pre>

<p><code class="highlight">File.dirname(__FILE__)</code> and <code class="highlight">File.join</code> is used to get the full absolute path to the <tt>underlings/</tt> directory. You should only put absolute paths such as <code class="highlight">"/usr/local/foo"</code> (or <code class="highlight">"C:\foo\bar"</code> on Windows) in the <code class="highlight">$LOAD_PATH</code>, and avoid things like <code class="highlight">$LOAD_PATH &lt;&lt; "lib/foo"</code>.</p>

<p>The snippet above will run successfully, because the require statement is able to handle <code class="highlight">"slave"</code> based on what&#8217;s in the <code class="highlight">$LOAD_PATH</code>. As you can see, <code class="highlight">$LOAD_PATH</code> is an array, and the directory names it contains are strings.</p>

<h2>The current directory is in the load path</h2>

<p>If you inspect <code class="highlight">$LOAD_PATH</code> in IRb, you&#8217;ll find <code class="highlight">"."</code> in it. That dot reperesents the current directory, and lets you require a file that is in the same directory as the file you require from. If <tt>foo.rb</tt> and <tt>bar.rb</tt>, you can <code class="highlight">require "bar"</code> from <tt>foo.rb</tt> without modifying the <code class="highlight">$LOAD_PATH</code>.</p>

<h2>That $: thing</h2>

<p><code class="highlight">$:</code> is a shorthand for <code class="highlight">$LOAD_PATH</code>. So now you know.</p> 
<p>(In fact, <code class="highlight">$LOAD_PATH</code> is longhand for <code class="highlight">$:</code>. Yeah! Thanks, <a href="http://smartic.us/">bryanl</a>.)</p>
