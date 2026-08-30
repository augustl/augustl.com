---
title: "Screwing up fixnum"
date: "2008-08-31"
content_format: "html"
archive_order: 84
---
<p>As <a href="http://chadfowler.com/">Chad Fowler</a> <a href="http://video.google.com/videoplay?docid=-8984753198261505541">said</a> (somewhere in there): Many languages, such as Java, is made for stupid programmers, Ruby isn't.</p>

<p>He doesn't mean that Java programmers are stupid, he means that unlike Java, Ruby allows stupid people to do stupid things.</p>

<p>Look at what Ruby kindly allows you to do:</p>

<pre><code class="highlight"><span class="nb">puts</span> <span class="mi">10</span> <span class="o">/</span> <span class="mi">2</span>
<span class="c1"># =&gt; 5</span>

<span class="k">class</span> <span class="nc">Fixnum</span>
  <span class="k">def</span> <span class="nf">/</span><span class="p">(</span><span class="n">other</span><span class="p">)</span>
    <span class="nb">self</span> <span class="o">+</span> <span class="n">other</span>
  <span class="k">end</span>
<span class="k">end</span>

<span class="nb">puts</span> <span class="mi">10</span> <span class="o">/</span> <span class="mi">2</span>
<span class="c1"># =&gt; 12</span></code></pre>

<p>Undoubtably a very stupid thing to do. Java would have complained, because Java does not let you do stupid things like this. Ruby allows it, though.</p>

<p>This is good. It means Ruby is flexible, and that if you can dream it, you can do it.</p>
