---
title: "Ruby Net::HTTP cheat sheet"
date: "2010-01-06"
content_format: "html"
updated: "2010-01-07"
---
<p><strong>Update</strong>: <a href="http://github.com/augustl/net-http-cheat-sheet">It&#8217;s on GitHub now</a>.</p>

<hr/>

<p>I always have to look up how to use <code class="highlight">Net::HTTP</code>, and I never find what I&#8217;m looking for. Behold, a cheat sheet!</p>

<h2>A basic request</h2>

<pre><code class="highlight"><span class="nb">require</span> <span class="s2">"net/https"</span>
<span class="nb">require</span> <span class="s2">"uri"</span>

<span class="n">uri</span> <span class="o">=</span> <span class="no">URI</span><span class="o">.</span><span class="n">parse</span><span class="p">(</span><span class="s2">"http://google.com"</span><span class="p">)</span>
<span class="n">http</span> <span class="o">=</span> <span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">.</span><span class="n">new</span><span class="p">(</span><span class="n">uri</span><span class="o">.</span><span class="n">host</span><span class="p">,</span> <span class="n">uri</span><span class="o">.</span><span class="n">port</span><span class="p">)</span>
<span class="n">request</span> <span class="o">=</span> <span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">::</span><span class="no">Get</span><span class="o">.</span><span class="n">new</span><span class="p">(</span><span class="n">uri</span><span class="o">.</span><span class="n">request_uri</span><span class="p">)</span>
<span class="n">request</span><span class="o">.</span><span class="n">initialize_http_header</span><span class="p">({</span><span class="s2">"User-Agent"</span> <span class="o">=&gt;</span> <span class="s2">"My Ruby Script"</span><span class="p">})</span>

<span class="n">response</span> <span class="o">=</span> <span class="n">http</span><span class="o">.</span><span class="n">request</span><span class="p">(</span><span class="n">request</span><span class="p">)</span>
<span class="nb">puts</span> <span class="n">response</span><span class="o">.</span><span class="n">code</span>
<span class="c1"># =&gt; 301</span>
<span class="nb">puts</span> <span class="n">response</span><span class="o">[</span><span class="s2">"location"</span><span class="o">]</span> <span class="c1"># All headers are lowercase</span>
<span class="c1"># =&gt; http://www.google.com/</span></code></pre>

<h2><span class="caps">URI</span></h2>

<pre><code class="highlight"><span class="n">uri</span> <span class="o">=</span> <span class="no">URI</span><span class="o">.</span><span class="n">parse</span><span class="p">(</span><span class="s2">"http://mysite.com/some_api"</span><span class="p">)</span>
<span class="n">uri</span> <span class="o">=</span> <span class="no">URI</span><span class="o">.</span><span class="n">parse</span><span class="p">(</span><span class="s2">"https://mysite.com/thing?foo=bar"</span><span class="p">)</span>

<span class="c1"># URI will also guess the correct port</span>
<span class="no">URI</span><span class="o">.</span><span class="n">parse</span><span class="p">(</span><span class="s2">"http://foo.com"</span><span class="p">)</span><span class="o">.</span><span class="n">port</span> <span class="c1"># =&gt; 80</span>
<span class="no">URI</span><span class="o">.</span><span class="n">parse</span><span class="p">(</span><span class="s2">"https://foo.com/"</span><span class="p">)</span><span class="o">.</span><span class="n">port</span> <span class="c1"># =&gt; 443</span>

<span class="c1"># Full reference</span>
<span class="n">uri</span> <span class="o">=</span> <span class="no">URI</span><span class="o">.</span><span class="n">parse</span><span class="p">(</span><span class="s2">"http://foo.com/this/is/everything?query=params"</span><span class="p">)</span>
<span class="c1"># p (uri.methods - Object.methods).sort</span>
<span class="nb">p</span> <span class="n">uri</span><span class="o">.</span><span class="n">scheme</span>        <span class="c1"># =&gt; "http"</span>
<span class="nb">p</span> <span class="n">uri</span><span class="o">.</span><span class="n">host</span>          <span class="c1"># =&gt; "foo.com"</span>
<span class="nb">p</span> <span class="n">uri</span><span class="o">.</span><span class="n">port</span>          <span class="c1"># =&gt; 80</span>
<span class="nb">p</span> <span class="n">uri</span><span class="o">.</span><span class="n">request_uri</span>   <span class="c1"># =&gt; "/this/is/everything?query=params"</span>
<span class="nb">p</span> <span class="n">uri</span><span class="o">.</span><span class="n">path</span>          <span class="c1"># =&gt; "/this/is/everything"</span>
<span class="nb">p</span> <span class="n">uri</span><span class="o">.</span><span class="n">query</span>         <span class="c1"># =&gt; "query=params"</span>

<span class="c1"># There are setters as well</span>
<span class="n">uri</span><span class="o">.</span><span class="n">port</span> <span class="o">=</span> <span class="mi">8080</span>
<span class="n">uri</span><span class="o">.</span><span class="n">host</span> <span class="o">=</span> <span class="s2">"google.com"</span>
<span class="n">uri</span><span class="o">.</span><span class="n">scheme</span> <span class="o">=</span> <span class="s2">"ftp"</span>
<span class="nb">p</span> <span class="n">uri</span><span class="o">.</span><span class="n">to_s</span>
<span class="c1"># =&gt; "ftp://google.com:8080/this/is/everything?query=param"</span></code></pre>

<h2>Everything else</h2>

<pre><code class="highlight"><span class="n">http</span> <span class="o">=</span> <span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">.</span><span class="n">new</span><span class="p">(</span><span class="n">uri</span><span class="o">.</span><span class="n">host</span><span class="p">,</span> <span class="n">uri</span><span class="o">.</span><span class="n">port</span><span class="p">)</span>
<span class="n">http</span><span class="o">.</span><span class="n">open_timeout</span> <span class="o">=</span> <span class="mi">3</span> <span class="c1"># in seconds</span>
<span class="n">http</span><span class="o">.</span><span class="n">read_timeout</span> <span class="o">=</span> <span class="mi">3</span> <span class="c1"># in seconds</span>

<span class="c1"># The request.</span>
<span class="n">request</span> <span class="o">=</span> <span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">::</span><span class="no">Get</span><span class="o">.</span><span class="n">new</span><span class="p">(</span><span class="n">uri</span><span class="o">.</span><span class="n">request_uri</span><span class="p">)</span>

<span class="c1"># All the HTTP 1.1 methods are available.</span>
<span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">::</span><span class="no">Get</span>
<span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">::</span><span class="no">Post</span>
<span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">::</span><span class="no">Put</span>
<span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">::</span><span class="no">Delete</span>
<span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">::</span><span class="no">Head</span>
<span class="no">Net</span><span class="o">::</span><span class="no">HTTP</span><span class="o">::</span><span class="no">Options</span>

<span class="n">request</span><span class="o">.</span><span class="n">body</span> <span class="o">=</span> <span class="s2">"Request body here."</span>
<span class="n">request</span><span class="o">.</span><span class="n">initialize_http_header</span><span class="p">({</span><span class="s2">"Accept"</span> <span class="o">=&gt;</span> <span class="s2">"*/*"</span><span class="p">})</span>
<span class="n">request</span><span class="o">.</span><span class="n">basic_auth</span><span class="p">(</span><span class="s2">"username"</span><span class="p">,</span> <span class="s2">"password"</span><span class="p">)</span>

<span class="n">response</span> <span class="o">=</span> <span class="n">http</span><span class="o">.</span><span class="n">request</span><span class="p">(</span><span class="n">request</span><span class="p">)</span>
<span class="n">response</span><span class="o">.</span><span class="n">body</span>
<span class="n">response</span><span class="o">.</span><span class="n">status</span>
<span class="n">response</span><span class="o">[</span><span class="s2">"header-here"</span><span class="o">]</span> <span class="c1"># All headers are lowercase</span></code></pre>

<h2><span class="caps">SSL</span></h2>

<pre><code class="highlight"><span class="c1"># Normal ssl</span>
<span class="n">http</span><span class="o">.</span><span class="n">use_ssl</span> <span class="o">=</span> <span class="kp">true</span>
<span class="n">http</span><span class="o">.</span><span class="n">verify_mode</span> <span class="o">=</span> <span class="no">OpenSSL</span><span class="o">::</span><span class="no">SSL</span><span class="o">::</span><span class="no">VERIFY_NONE</span>

<span class="c1"># SSL .pem certs</span>
<span class="n">pem</span> <span class="o">=</span> <span class="no">File</span><span class="o">.</span><span class="n">read</span><span class="p">(</span><span class="s2">"/path/to/my.pem"</span><span class="p">)</span>
<span class="n">http</span><span class="o">.</span><span class="n">use_ssl</span> <span class="o">=</span> <span class="kp">true</span>
<span class="n">http</span><span class="o">.</span><span class="n">cert</span> <span class="o">=</span> <span class="no">OpenSSL</span><span class="o">::</span><span class="no">X509</span><span class="o">::</span><span class="no">Certificate</span><span class="o">.</span><span class="n">new</span><span class="p">(</span><span class="n">pem</span><span class="p">)</span>
<span class="n">http</span><span class="o">.</span><span class="n">key</span> <span class="o">=</span> <span class="no">OpenSSL</span><span class="o">::</span><span class="no">PKey</span><span class="o">::</span><span class="no">RSA</span><span class="o">.</span><span class="n">new</span><span class="p">(</span><span class="n">pem</span><span class="p">)</span>
<span class="n">http</span><span class="o">.</span><span class="n">verify_mode</span> <span class="o">=</span> <span class="no">OpenSSL</span><span class="o">::</span><span class="no">SSL</span><span class="o">::</span><span class="no">VERIFY_PEER</span>

<span class="c1"># Check for SSL dynamically. If your URI is https and you don't specify a</span>
<span class="c1"># port, the port will be 443, which is the correct SSL port.</span>
<span class="n">http</span><span class="o">.</span><span class="n">use_ssl</span> <span class="o">=</span> <span class="p">(</span><span class="n">uri</span><span class="o">.</span><span class="n">port</span> <span class="o">==</span> <span class="mi">443</span><span class="p">)</span></code></pre>
