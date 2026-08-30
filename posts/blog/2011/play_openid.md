---
title: "OpenID authentication with attributes in Play"
date: "2011-10-16"
content_format: "html"
archive_order: 55
---
<p>In an effort to <a href="http://chronicle.com/article/How-to-ProcrastinateStill/93959">procrastinate and still get things done</a>, I started work on a new project even though <a href="http://busterjs.org/">Buster.JS</a> isn't done yet. That's more useful than spending all day playing Minecraft, I guess.</p>

<p>The app will support OpenID authentication. I'm using the <a href="http://www.playframework.org/">Play</a> framework, which has built in support for OpenID. The docs for Attribute Exchange (AX) and Simple Registration (SREG) in Play's OpenID module are very sparse, though. So I decided to write about my discoveries here.</p>

<p>Here's a code-dump. The routes:</p>

<pre>GET     /login                                  Authentication.index
POST    /login                                  Authentication.create</pre>

<p>The view:</p>

<pre><code class="highlight">#{form @Authentication.create()}
  &lt;input type="text" name="openid_url" /&gt;
  &lt;input type="submit" value="Log in" /&gt;
#{/form}</code></pre>

<p>My controller:</p>

<pre><code class="highlight"><span class="kn">package</span> <span class="nn">controllers</span><span class="o">;</span>

<span class="kn">import</span> <span class="nn">play.mvc.Controller</span><span class="o">;</span>
<span class="kn">import</span> <span class="nn">play.libs.OpenID</span><span class="o">;</span>
<span class="kn">import</span> <span class="nn">play.libs.OpenID.*</span><span class="o">;</span>

<span class="kd">public</span> <span class="kd">class</span> <span class="nc">Authentication</span> <span class="kd">extends</span> <span class="n">Controller</span> <span class="o">{</span>
    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">void</span> <span class="nf">index</span><span class="o">()</span> <span class="o">{</span>
        <span class="k">if</span> <span class="o">(</span><span class="n">OpenID</span><span class="o">.</span><span class="na">isAuthenticationResponse</span><span class="o">())</span> <span class="o">{</span>
            <span class="c1">// Postback from OpenID provider.</span>
            <span class="n">UserInfo</span> <span class="n">verifiedUserInfo</span> <span class="o">=</span> <span class="n">OpenID</span><span class="o">.</span><span class="na">getVerifiedID</span><span class="o">();</span>

            <span class="k">if</span> <span class="o">(</span><span class="n">verifiedUserInfo</span> <span class="o">!=</span> <span class="kc">null</span><span class="o">)</span> <span class="o">{</span>
                <span class="c1">// Store verifiedUserInfo.id</span>
                <span class="k">if</span> <span class="o">(</span><span class="n">verifiedUserInfo</span><span class="o">.</span><span class="na">extensions</span> <span class="o">!=</span> <span class="kc">null</span><span class="o">)</span> <span class="o">{</span>
                    <span class="n">renderText</span><span class="o">(</span><span class="n">verifiedUserInfo</span><span class="o">.</span><span class="na">extensions</span><span class="o">.</span><span class="na">toString</span><span class="o">());</span>
                <span class="o">}</span> <span class="k">else</span> <span class="o">{</span>
                    <span class="n">renderText</span><span class="o">(</span><span class="s">"Logged in. Failed to get attributes"</span><span class="o">);</span>
                <span class="o">}</span>
            <span class="o">}</span> <span class="k">else</span> <span class="o">{</span>
                <span class="n">renderText</span><span class="o">(</span><span class="s">"Failed to log in."</span><span class="o">);</span>
            <span class="o">}</span>
        <span class="o">}</span> <span class="k">else</span> <span class="o">{</span>
            <span class="c1">// Render login form.</span>
            <span class="n">render</span><span class="o">();</span>
        <span class="o">}</span>
    <span class="o">}</span>

    <span class="kd">public</span> <span class="kd">static</span> <span class="kt">void</span> <span class="nf">create</span><span class="o">()</span> <span class="o">{</span>
        <span class="n">String</span> <span class="n">openIdURL</span> <span class="o">=</span> <span class="n">params</span><span class="o">.</span><span class="na">get</span><span class="o">(</span><span class="s">"openid_url"</span><span class="o">);</span>
        <span class="n">OpenID</span> <span class="n">openIdReq</span> <span class="o">=</span> <span class="n">OpenID</span><span class="o">.</span><span class="na">id</span><span class="o">(</span><span class="n">openIdURL</span><span class="o">);</span>
            
        <span class="c1">// Attribute Exchange (AX)</span>
        <span class="n">openIdReq</span><span class="o">.</span><span class="na">required</span><span class="o">(</span><span class="s">"email"</span><span class="o">,</span> <span class="s">"http://axschema.org/contact/email"</span><span class="o">);</span>
        <span class="n">openIdReq</span><span class="o">.</span><span class="na">required</span><span class="o">(</span><span class="s">"firstName"</span><span class="o">,</span> <span class="s">"http://axschema.org/namePerson/first"</span><span class="o">);</span>
        <span class="n">openIdReq</span><span class="o">.</span><span class="na">required</span><span class="o">(</span><span class="s">"lastName"</span><span class="o">,</span> <span class="s">"http://axschema.org/namePerson/last"</span><span class="o">);</span>

        <span class="c1">// Simple Registration (SREG)</span>
        <span class="n">openIdReq</span><span class="o">.</span><span class="na">required</span><span class="o">(</span><span class="s">"email"</span><span class="o">);</span>
        <span class="n">openIdReq</span><span class="o">.</span><span class="na">optional</span><span class="o">(</span><span class="s">"fullname"</span><span class="o">);</span>
        <span class="n">openIdReq</span><span class="o">.</span><span class="na">optional</span><span class="o">(</span><span class="s">"timezone"</span><span class="o">);</span>

        <span class="c1">// Perform redirect</span>
        <span class="n">openIdReq</span><span class="o">.</span><span class="na">verify</span><span class="o">();</span>
    <span class="o">}</span>
<span class="o">}</span></code></pre>

<p>The code pretty much speaks for itself. A few things to note:</p>

<ul>
  <li>The AX and SREG attributes should both be in place. Different OpenID providers use different methods of attribute exchange. MyOpenId uses SREG. Google uses AX. You may not get all the attributes you request.</li>
  <li>The value of the first argument for AX is optional. It specifies the key name in the user info returned from the OpenID request.</li>
  <li>The value of the argument for sreg is not optional. It has to match the SREG field name conventions.</li>
  <li>Attribute exchange is a mess. I'm yet to find a reference. Seems your best bet is provider specific documentation, and manual testing. Bot for SREG and AX. Here's <a href="http://code.google.com/apis/accounts/docs/OpenID.html#Parameters">Google's</a> documentation, for example.</li>
  <li>Google won't give you first and last name if they're optional, just to spice things up.</li>
  <li>You want to store the <code class="highlight">verifiedUserInfo.id</code> with your user record. This is what you will use to identify a future OpenID log in from the same Open ID with your internal user record.</li>
  <li>The OpenID login URL for Google is https://www.google.com/accounts/o8/id. It's the same for all Google accounts, since Google will use cookies and not the URL itself to identify.</li>
</ul>
