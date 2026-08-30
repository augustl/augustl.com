---
title: "Converting from Sorcery (Rails plugin) to plain BCrypt"
date: "2013-02-21"
content_format: "html"
---
<p>I recently split a Rails app into one Ruby app and a set of Clojure apps. The authentication in the Rails app was implemented using the Sorcery plugin, which defaults to BCrypt, so porting to Clojure is relatively easy, since BCrypt is a standard crypto method with implementations available on most platforms.</p>

<p>But as always with magic Rails plugins, there was a twist :)</p>

<h2>The solution</h2>

<p>This is the Clojure code I ended up with:</p>

<pre><code class="highlight"><span class="p">(</span><span class="nf">BCrypt/checkpw</span> <span class="p">(</span><span class="nb">str </span><span class="nv">password</span> <span class="nv">old-rails-salt</span><span class="p">)</span> <span class="nv">old-rails-password-hash</span><span class="p">)</span></code></pre>

<p><code class="highlight">old-rails-salt</code> is the contents of the <code class="highlight">User#salt</code> from the Rails app. Also, <code class="highlight">old-rails-password-hash</code> is the contents of the <code class="highlight">User#crypted_password</code>.</p>

<p>Normally, all you need to do is to pass the password and the BCrypt password hash. The BCrypt hash already includes a salt as part of its contents, so there's no need for an additional salt. For some reason, Sorcery also salts the password by appending <code class="highlight">User#salt</code> to the password before hashing it.</p>

<p>My theory is that this is an artifact of the modularity of Sorcery. When Sorcery uses SHA1, it needs to salt, and Sorcery isn't coded so that salting the password is optional. And it doesn't hurt usability on the Rails end, since sorcery is very automagic. As we can see, it's less than ideal when we want to use Sorcery crypto outside of Sorcery, so it's not very portable. But I'm not gonna complain, I guess it's rare to move from Sorcery to another auth system, or even another platform altogether, so they just haven't fixed it. I should probably stop complaining and submit a patch.</p>

<p>The full code:</p>

<pre><code class="highlight"><span class="p">(</span><span class="kd">defn </span><span class="nv">valid-password?</span>
  <span class="p">[</span><span class="nv">user</span> <span class="nv">password</span><span class="p">]</span>
  <span class="p">(</span><span class="nb">if-let </span><span class="p">[</span><span class="nv">old-rails-salt</span> <span class="p">(</span><span class="ss">:old_rails_salt</span> <span class="nv">user</span><span class="p">)]</span>
    <span class="p">(</span><span class="nf">BCrypt/checkpw</span> <span class="p">(</span><span class="nb">str </span><span class="nv">password</span> <span class="nv">old-rails-salt</span><span class="p">)</span> <span class="p">(</span><span class="ss">:password_hash</span> <span class="nv">user</span><span class="p">))</span>
    <span class="p">(</span><span class="nf">BCrypt/checkpw</span> <span class="nv">password</span> <span class="p">(</span><span class="ss">:password_hash</span> <span class="nv">user</span><span class="p">))))</span></code></pre>

<p>Only users imported from the Rails database will have <code class="highlight">old_rails_salt</code> set on them, newly created users will not.</p>
