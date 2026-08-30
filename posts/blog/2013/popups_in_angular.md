---
title: "Asynchronous and flexible modal popups in AngularJS"
date: "2013-03-11"
content_format: "html"
---
<p>This post is a description of the technique I'm using to show modeal popups in AngularJS.</p>

<p>The end result is a <code class="highlight">&amp;lt;div&amp;gt;</code> in the body that contains an AngularJS enabled template. That's it. There's no actual rendering of a popup, such as keeping the popup centred on the page, drawing a transparent background above the rest of the page, etc.</p>

<p>Here's the full tl;dr of the code.</p>

<pre><code class="highlight"><span class="c1">// You need to fetch $compile from the dependency injector</span>

<span class="c1">// This is how you create a raw AngularJS template. You can use</span>
<span class="c1">// anything you want here, such as ng-repeat, etc etc.</span>
<span class="c1">// In this case, all we need is an angular template that includes</span>
<span class="c1">// the template we actually want to show inside the popup. This</span>
<span class="c1">// lets Angular handle the loading of the template etc. for us.</span>
<span class="kd">var</span> <span class="nx">popupTemplate</span> <span class="o">=</span> <span class="nb">document</span><span class="p">.</span><span class="nx">createElement</span><span class="p">(</span><span class="s2">"div"</span><span class="p">);</span>
<span class="nx">popupTemplate</span><span class="p">.</span><span class="nx">setAttribute</span><span class="p">(</span><span class="s2">"ng-include"</span><span class="p">,</span> <span class="s2">"'/my-popup-contents-template.html'"</span><span class="p">);</span>

<span class="c1">// We give the popup a new scope, inherited from the current one.</span>
<span class="kd">var</span> <span class="nx">popupScope</span> <span class="o">=</span> <span class="nx">$scope</span><span class="p">.</span><span class="nx">$new</span><span class="p">();</span>
<span class="nx">popupScope</span><span class="p">.</span><span class="nx">someValue</span> <span class="o">=</span> <span class="nb">Math</span><span class="p">.</span><span class="nx">random</span><span class="p">();</span>
<span class="kd">var</span> <span class="nx">popupLinker</span> <span class="o">=</span> <span class="nx">$compile</span><span class="p">(</span><span class="nx">popupTemplate</span><span class="p">);</span>
<span class="kd">var</span> <span class="nx">popupElement</span> <span class="o">=</span> <span class="nx">popupLinker</span><span class="p">(</span><span class="nx">popupScope</span><span class="p">);</span>

<span class="c1">// popupElement is now a div that contains your template,</span>
<span class="c1">// fully AngularJS enabled. How you display it as a popup</span>
<span class="c1">// is up to you.</span>
<span class="nx">myShowPopupFunction</span><span class="p">(</span><span class="nx">popupElement</span><span class="p">);</span>

<span class="nx">popupScope</span><span class="p">.</span><span class="nx">$on</span><span class="p">(</span><span class="s2">"finished"</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
  <span class="nx">myHidePopupFunction</span><span class="p">(</span><span class="nx">popupElement</span><span class="p">);</span>

  <span class="c1">// Avoid leaks and nasty stuff. Destroying the scope when</span>
  <span class="c1">// the popup is hidden is absolutely vital.</span>
  <span class="nx">popupScope</span><span class="p">.</span><span class="nx">$destroy</span><span class="p">();</span>
<span class="p">});</span></code></pre>

<p>You get a DOM element that is your popup contents. It's up to you how you display it. The contents of the popup is a fully "Angularized" template, where you can do all the usual AngularJS stuff.</p>

<h2>Adding a controller</h2>

<p>I like to make my templates self-contained, and declare the controller in them. In this example, the file <tt>/my/template.html</tt> could contain the following:</p>

<pre><code class="highlight"><span class="c">&lt;!-- This is the file: /my-popup-contents-template.html --&gt;</span>

<span class="p">&lt;</span><span class="nt">p</span><span class="p">&gt;</span>Works outside the controller: {{someValue}}<span class="p">&lt;/</span><span class="nt">p</span><span class="p">&gt;</span>

<span class="p">&lt;</span><span class="nt">div</span> <span class="na">ng-controller</span><span class="o">=</span><span class="s">"MyPopupContentsController"</span><span class="p">&gt;</span>
   <span class="p">&lt;</span><span class="nt">p</span><span class="p">&gt;</span>.. stuff ...<span class="p">&lt;/</span><span class="nt">p</span><span class="p">&gt;</span>
   <span class="p">&lt;</span><span class="nt">p</span><span class="p">&gt;</span>{{ 5 + 5 }}<span class="p">&lt;/</span><span class="nt">p</span><span class="p">&gt;</span>
   <span class="p">&lt;</span><span class="nt">p</span><span class="p">&gt;</span>And works inside the controller: {{someValue}}<span class="p">&lt;/</span><span class="nt">p</span><span class="p">&gt;</span>
<span class="p">&lt;/</span><span class="nt">div</span><span class="p">&gt;</span></code></pre>

<p>Since the <code class="highlight">popupTemplate</code> is just a regular AngularJS template, you're also free to set ng-controller there, in a div that wraps the ng-include.</p>

<h2>The <code class="highlight">"finished"</code> event</h2>

<p>I typically have a close button in my popup that emits the <code class="highlight">"finished"</code> event. When this event is emitted, the code that displayed the popup will hide it.</p>

<p>It's also important to destroy the scope that was created with <code class="highlight">$scope.$new();</code> to avoid leaks. The popup controller might add watch statements and other things, that will be nuked when you <code class="highlight">$destroy()</code> the scope. So pairing the hiding code with the teardown code makes sense, so it's impossible/difficult to hide the popup without also destroying the scope.</p>

<h2>Why the extra scope?</h2>

<p>ng-include will create a new scope for us. Why do we need the extra <code class="highlight">popupScope</code>?</p>

<p>The answer is teardown and garbage collection. As mentioned above, our popup might add watch statements and do other nasty side effecty things. And we don't actually have direct access to the scope created by ng-include. So we create our own scope that we can control, that will destroy all its child scopes - the ng-include scope and any ng-controller scopes, and so on.</p>

<h2>What is <code class="highlight">$compile</code>?</h2>

<p>This is angular terminology. Compile takes an AngularJS template in the form of DOM elements. Calling compile on a DOM element parses the DOM as an AngularJS template and returns a linker. The linker is a reusable function that takes a scope and returns a DOM element that hooks up the template and the scope. This allows you to use a linker with any scope, as many times as you want. This is essentially how directives work, and it's also the reason directives have a "link" method.</p>

<p>To get a hold of <code class="highlight">$compile</code>, just use the normal dependency injection techniques.</p>

<pre><code class="highlight"><span class="nx">MyApp</span><span class="p">.</span><span class="nx">controller</span><span class="p">(</span><span class="s2">"MyController"</span> <span class="p">,</span>
  <span class="p">[</span><span class="s2">"$scope"</span><span class="p">,</span> <span class="s2">"$compile"</span><span class="p">,</span> <span class="kd">function</span> <span class="p">(</span><span class="nx">$scope</span><span class="p">,</span> <span class="nx">$compile</span><span class="p">)</span> <span class="p">{</span>
    <span class="nx">$scope</span><span class="p">.</span><span class="nx">showAPopup</span> <span class="o">=</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
      <span class="c1">// Same as the code block at the beginning of this post.</span>
      <span class="kd">var</span> <span class="nx">popupTpl</span> <span class="o">=</span> <span class="nb">document</span><span class="p">.</span><span class="nx">createElement</span><span class="p">(</span><span class="s2">"div"</span><span class="p">);</span>
      <span class="nx">popupTpl</span><span class="p">.</span><span class="nx">setAttribute</span><span class="p">(</span><span class="s2">"ng-include"</span><span class="p">,</span> <span class="s2">"'/my-popup-contents-template.html'"</span><span class="p">);</span>
      <span class="kd">var</span> <span class="nx">popupScope</span> <span class="o">=</span> <span class="nx">$scope</span><span class="p">.</span><span class="nx">$new</span><span class="p">()</span>
      <span class="nx">myShowPopupFunction</span><span class="p">(</span><span class="nx">$compile</span><span class="p">(</span><span class="nx">popupTpl</span><span class="p">)(</span><span class="nx">popupScope</span><span class="p">))</span>
      <span class="nx">popupScope</span><span class="p">.</span><span class="nx">$on</span><span class="p">(</span><span class="s2">"finished"</span><span class="p">,</span> <span class="kd">function</span> <span class="p">()</span> <span class="p">{</span>
        <span class="nx">myHidePopupFunction</span><span class="p">();</span>
        <span class="nx">popupScope</span><span class="p">.</span><span class="nx">$destroy</span><span class="p">();</span>
      <span class="p">});</span>
    <span class="p">};</span>
  <span class="p">}]);</span></code></pre>

<pre><code class="highlight"><span class="c">&lt;!-- Template --&gt;</span>
<span class="p">&lt;</span><span class="nt">a</span> <span class="na">ng-click</span><span class="o">=</span><span class="s">"showAPopup()"</span><span class="p">&gt;&lt;/</span><span class="nt">a</span><span class="p">&gt;</span></code></pre>

<h2>Go render some popups!</h2>

<p>This technique lets you have as many popups as you want on a single page, and it lets you render the popups any way you want to. You don't have to, say, put the popup HTML in your angular template, and ng-hide it until you want to show it. The popup is only initialized when you want to, and you can display it with any API that takes a DOM element and displays it as a popup (hint: most jQuery plugins out there).</p>
