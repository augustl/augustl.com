---
title: "Make form_for not call methods on your model"
date: "2012-01-16"
content_format: "html"
---
<p>I'm writing a Rails app that uses a custom model class to interact with Apache CouchDB via <a href="https://github.com/couchrest/couchrest">couchrest</a>. The app is very schemaless in nature, which is one of the reasons I'm using CouchDB in the first place.</p>

<p>Rails' <code class="highlight">form_for</code> expects models that have methods for all its attributes. This is a problem, since my custom model doesn't define methods for the attributes. It stores data in a hash, and provides hash-like methods (<code class="highlight">[]</code> and <code class="highlight">[]=</code>) to access data. Creating methods for my attributes are not viable, since I don't know which attributes my models have beforehand, when I want forms for <code class="highlight">@user = User.new</code>, for example.</p>

<p>So a form like this:</p>

<pre><code class="highlight">&lt;%= form_for @user, :path =&gt; session_path do |f| %&gt;
  &lt;%= f.form_for :name %&gt;
&lt;% end %&gt;</code></pre>

<p>Basically ends up doing this:</p>

<pre><code class="highlight">@user.send("name")</code></pre>

<p>What I need it to do, is this:<p>

<pre><code class="highlight">@user[:name]</code></pre>

<p>To change this behaviour, we unfortunately need to monkey patch. I haven't found any APIs for it, and it boils down to a unconfigurable low level class called <code class="highlight">ActionView::Helpers::InstanceTag</code>, so creating a custom <code class="highlight">form_for</code> isn't viable.</p>

<p>I added the snippet below to <tt>config/initializers/monkey_patches.rb</tt>.</p>

<pre><code class="highlight">class ActionView::Helpers::InstanceTag
  def self.value(object, method_name)
    object[method_name.to_sym] if object
  end

  def self.value_before_type_cast(object, method_name)
    self.value(object, method_name)
  end
end</code></pre>

<p><a href="https://github.com/rails/rails/blob/v3.1.3/actionpack/lib/action_view/helpers/form_helper.rb#L1126">Here's the original source code on GitHub</a> for these two methods. As you can see, my particular implementation may not solve your problems, and ignores the <code class="highlight">_before_type_cast</code> stuff since my particular model class doesn't do type casting.</p>

<p>I did not investigate why <code class="highlight">method_name</code> is a string, given I originally specified it as a symbol in <code class="highlight">f.text_field</code>.</p>
