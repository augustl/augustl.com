---
title: "HTML list helper"
date: "2007-11-21"
content_format: "html"
archive_order: 100
---
<p>Tidy up HTML-list creation in views with one-liner neatness.</p>

<p>I use this one in pretty much all of them projects of mine.</p>

<pre><code class="highlight"><span class="k">def</span> <span class="nf">list</span><span class="p">(</span><span class="n">stuff</span><span class="p">)</span>
  <span class="n">content_tag</span><span class="p">(</span><span class="ss">:ul</span><span class="p">,</span> <span class="n">stuff</span><span class="o">.</span><span class="n">map</span> <span class="p">{</span> <span class="o">|</span><span class="n">thingie</span><span class="o">|</span> <span class="n">content_tag</span><span class="p">(</span><span class="ss">:li</span><span class="p">,</span> <span class="k">yield</span><span class="p">(</span><span class="n">thingie</span><span class="p">))</span> <span class="p">})</span>
<span class="k">end</span></code></pre>

<p>Usage:</p>

<pre><code class="highlight"><span class="o">&lt;%=</span> <span class="n">list</span><span class="p">(</span><span class="vi">@posts</span><span class="p">)</span> <span class="p">{</span><span class="o">|</span><span class="n">post</span><span class="o">|</span> <span class="n">link_to</span><span class="p">(</span><span class="n">post</span><span class="o">.</span><span class="n">title</span><span class="p">,</span> <span class="n">post_url</span><span class="p">(</span><span class="n">post</span><span class="p">))</span> <span class="p">}</span> <span class="o">%&gt;</span></code></pre>

<p>Pretty pretty. Much better than this:</p>

<pre><code class="highlight"><span class="x">&lt;ul&gt;</span>
<span class="x">  </span><span class="cp">&lt;%</span> <span class="vi">@posts</span><span class="o">.</span><span class="n">each</span> <span class="k">do</span> <span class="o">|</span><span class="n">post</span><span class="o">|</span> <span class="cp">%&gt;</span><span class="x"></span>
<span class="x">    &lt;li&gt;</span><span class="cp">&lt;%=</span> <span class="n">link_to</span><span class="p">(</span><span class="o">...</span><span class="p">)</span> <span class="cp">%&gt;</span><span class="x">&lt;/li&gt;</span>
<span class="x">  </span><span class="cp">&lt;%</span> <span class="k">end</span> <span class="cp">%&gt;</span><span class="x"></span>
<span class="x">&lt;/ul&gt;</span></code></pre>
