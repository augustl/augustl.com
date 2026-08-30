---
title: "Things you can do in Ruby"
date: "2008-09-19"
content_format: "html"
archive_order: 75
---
<h2>Arrays</h2>

<p>Subtracting.</p>

<pre><code class="highlight"><span class="n">everyone</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"Jane"</span><span class="p">,</span> <span class="s2">"Joe"</span><span class="p">,</span> <span class="s2">"Tom"</span><span class="p">,</span> <span class="s2">"why"</span><span class="p">,</span> <span class="s2">"Roger"</span><span class="o">]</span>
<span class="n">coming</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"Tom"</span><span class="p">,</span> <span class="s2">"Joe"</span><span class="o">]</span>
<span class="n">not_coming</span> <span class="o">=</span> <span class="n">everyone</span> <span class="o">-</span> <span class="n">coming</span>
<span class="c1"># =&gt; ["Jane", "why", "Roger"]</span></code></pre>

<p>Intersection. Elements common to both arrays.</p>

<pre><code class="highlight"><span class="n">my_party</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"Jane"</span><span class="p">,</span> <span class="s2">"Tom"</span><span class="p">,</span> <span class="s2">"Roger"</span><span class="p">,</span> <span class="s2">"Bob"</span><span class="o">]</span>
<span class="n">jons_party</span> <span class="o">=</span> <span class="o">[</span><span class="s2">"Warren"</span><span class="p">,</span> <span class="s2">"Bob"</span><span class="p">,</span> <span class="s2">"Vinnie"</span><span class="o">]</span>
<span class="n">double_booked</span> <span class="o">=</span> <span class="n">my_party</span> <span class="o">&amp;</span> <span class="n">jons_party</span>
<span class="c1"># =&gt; ["Bob"]</span></code></pre>

<p>A list of words. These two statements are equivalent.</p>

<pre><code class="highlight"><span class="sx">%w(Jane Joe Tom)</span>
<span class="o">[</span><span class="s1">'Jane'</span><span class="p">,</span> <span class="s1">'Joe'</span><span class="p">,</span> <span class="s1">'Tom'</span><span class="o">]</span></code></pre>

<p>You can also escape spaces, if you really want to.</p>

<pre><code class="highlight"><span class="sx">%w(foo bar\ baz)</span>
<span class="c1"># =&gt; ['foo', 'bar baz']</span></code></pre>

<p>You should probably use the regular array syntax for that, though.</p>

<h2>Strings</h2>

<p>Formatting.</p>

<pre><code class="highlight"><span class="n">greeting</span> <span class="o">=</span> <span class="s2">"Hello, %s. You are %d years old."</span>
<span class="n">greeting</span> <span class="o">%</span> <span class="o">[</span><span class="s2">"Roger"</span><span class="p">,</span> <span class="mi">5</span><span class="o">]</span>
<span class="c1"># =&gt; Hello, Roger. You are 5 years old.</span></code></pre>

<p>Encrypting (one-way, irreversible)</p>

<pre><code class="highlight"><span class="n">secret_password</span> <span class="o">=</span> <span class="s2">"peUdjGQDziI8w"</span>
<span class="n">secret_password</span> <span class="o">==</span> <span class="s2">"foo"</span><span class="o">.</span><span class="n">crypt</span><span class="p">(</span><span class="s2">"hai"</span><span class="p">)</span>
<span class="c1"># =&gt; false</span>
<span class="n">secret_password</span> <span class="o">==</span> <span class="s2">"foo"</span><span class="o">.</span><span class="n">crypt</span><span class="p">(</span><span class="s2">"pepper"</span><span class="p">)</span>
<span class="c1"># =&gt; true</span></code></pre>

<p>Different literals.</p>

<pre><code class="highlight"><span class="sx">%q{You are learning Ruby}</span>
<span class="sx">%Q{You are learning Ruby. You can have "double quotes" in </span>
<span class="sx">here. and </span><span class="si">#{</span><span class="n">foo</span><span class="si">}</span><span class="sx"> interpolation. }</span></code></pre>

<h2>Hashes</h2>

<p>Default values.</p>

<pre><code class="highlight"><span class="n">parties</span> <span class="o">=</span> <span class="p">{}</span>
<span class="n">parties</span><span class="o">[</span><span class="s2">"Summer Party"</span><span class="o">]</span>
<span class="c1"># =&gt; nil</span>

<span class="n">parties</span> <span class="o">=</span> <span class="no">Hash</span><span class="o">.</span><span class="n">new</span> <span class="p">{</span><span class="o">|</span><span class="nb">hash</span><span class="p">,</span> <span class="n">key</span><span class="o">|</span> <span class="nb">hash</span><span class="o">[</span><span class="n">key</span><span class="o">]</span> <span class="o">=</span> <span class="o">[]</span> <span class="p">}</span>
<span class="n">parties</span><span class="o">[</span><span class="s2">"Summer Party"</span><span class="o">]</span>
<span class="c1"># =&gt; []</span>

<span class="n">parties</span><span class="o">[</span><span class="s2">"Summer Party"</span><span class="o">]</span> <span class="o">&lt;&lt;</span> <span class="s2">"Roger"</span>
<span class="n">parties</span><span class="o">[</span><span class="s2">"Summer Party"</span><span class="o">]</span> <span class="o">&lt;&lt;</span> <span class="s2">"Jane"</span>
<span class="n">parties</span><span class="o">[</span><span class="s2">"Ballpen Party"</span><span class="o">]</span> <span class="o">&lt;&lt;</span> <span class="s2">"Bob"</span>
<span class="n">parties</span><span class="o">[</span><span class="s2">"Completely Different"</span><span class="o">]</span>  <span class="o">=</span> <span class="mi">5</span>

<span class="n">parties</span>
<span class="c1"># =&gt; {"Ballpen Party" =&gt; ["Bob", "Jane"], "Completely Different" =&gt; 5, "Summer Party" =&gt; ["Roger"]}</span></code></pre>

<h2>Shelling out</h2>

<p>You can run system commands, too.</p>

<pre><code class="highlight"><span class="sb">`which ruby`</span> <span class="c1"># =&gt; /usr/bin/ruby</span>
<span class="sx">%x{which ruby}</span> <span class="c1"># =&gt; /usr/bin/ruby</span></code></pre>

<h2>Further reading</h2>

<ul>
  <li><a href="http://www.zenspider.com/Languages/Ruby/QuickRef.html">The Ruby QuickRef</a></li>
  <li><a href="http://heycarsten.com/2008/9/29/basic-rubyisms-ruby-programmers-should-know">heycarsten.com - Basic Rubyisms Ruby Programmers Should Know</a></li>
</ul>
