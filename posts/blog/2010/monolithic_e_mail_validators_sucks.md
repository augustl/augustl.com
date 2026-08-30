---
title: "Monolithic e-mail validators sucks"
date: "2010-01-17"
content_format: "html"
archive_order: 63
---
<pre><code class="highlight"><span class="n">validates_format_of</span> <span class="ss">:email</span><span class="p">,</span>
  <span class="ss">:with</span> <span class="o">=&gt;</span> <span class="sr">/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/</span>
  <span class="ss">:message</span> <span class="o">=&gt;</span> <span class="s2">"E-mail is invalid"</span></code></pre>
 
<p>Great error messages are cornerstones in great applications.</p>

<p>&#8220;E-mail is invalid&#8221; is not a great error message.</p>

<p>Invalid? What&#8217;s invalid about it? What can you do to make it valid?</p>

<p>I think you should be nicer to your users. Stop worrying about compliance with the RFCs, and validate erroneous user input instead.</p>

<pre><code class="highlight"><span class="n">validates_format_of</span> <span class="ss">:email</span><span class="p">,</span>
  <span class="ss">:with</span> <span class="o">=&gt;</span> <span class="sr">/@/</span><span class="p">,</span>
  <span class="ss">:message</span> <span class="o">=&gt;</span> <span class="s2">"Needs to contain an @."</span>

<span class="n">validates_format_of</span> <span class="ss">:email</span><span class="p">,</span>
  <span class="ss">:with</span> <span class="o">=&gt;</span> <span class="sr">/\.[^\.]+$/</span><span class="p">,</span>
  <span class="ss">:message</span> <span class="o">=&gt;</span> <span class="s2">"Has to end with .com, .org, .net, etc."</span>

<span class="n">validates_format_of</span> <span class="ss">:email</span><span class="p">,</span>
  <span class="ss">:with</span> <span class="o">=&gt;</span> <span class="sr">/^.+@/</span><span class="p">,</span>
  <span class="ss">:message</span> <span class="o">=&gt;</span> <span class="s2">"Must have an address before the @"</span>

<span class="n">validates_format_of</span> <span class="ss">:email</span><span class="p">,</span>
  <span class="ss">:with</span> <span class="o">=&gt;</span> <span class="sr">/^[^@]+@[^@]+$/</span><span class="p">,</span>
  <span class="ss">:message</span> <span class="o">=&gt;</span> <span class="s2">"Must be of the format 'something@something.xxx'"</span></code></pre>

<p>Now we&#8217;re talking. By having many small validators instead of one large, you get to pick an error message for each validator. Much better than a global and generic &#8220;not valid&#8221;. Your user gets to know what went wrong, and what he or she can do to fix it.</p>

<p>And you won&#8217;t need a black belt in regular expressions, either.</p>
