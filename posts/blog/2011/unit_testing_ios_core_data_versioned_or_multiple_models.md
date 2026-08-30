---
title: "Unit testing iOS: Core Data with multiple and/or versioned models"
date: "2011-01-31"
content_format: "html"
---
<p>In my article <a href="http://augustl.com/blog/2010/ios_unit_testing_tips_and_tricks">iOS unit testing tips & tricks</a>, I explained how I use an in-memory managed object context in my unit tests. This article updates some code from that section. The old code did not work in a project that used versioned models.</p>

<h2>Specifying the model name</h2>

<p>The old version of the script had the following in it:</p>

<pre><code class="highlight">[NSManagedObjectModel mergedModelFromBundles:[NSBundle allBundles]]</code></pre>

<p>This is problematic. If your project has a model with multiple versions, you will get an error saying <em>Can't merge models with two different entities named 'MyEntityName'</em>. This is because it finds all the versions of your model in <code class="highlight">[NSBundle allBundles]</code>, treats them as separate models, and tries to merge them. Merging two almost identical models will throw errors.</p>

<p>You can solve the problem by altering the code to only get the model you want to use:</p>

<pre><code class="highlight"><span class="c1">// Old</span>
<span class="n">model</span> <span class="o">=</span> <span class="p">[</span><span class="bp">NSManagedObjectModel</span> <span class="nl">mergedModelFromBundles</span><span class="p">:[</span><span class="bp">NSBundle</span> <span class="n">allBundles</span><span class="p">]];</span>

<span class="c1">// New</span>
<span class="k">static</span> <span class="bp">NSString</span> <span class="o">*</span><span class="n">testTargetName</span> <span class="o">=</span> <span class="s">@"Tests"</span><span class="p">;</span>
<span class="bp">NSBundle</span> <span class="o">*</span><span class="n">testsBundle</span><span class="p">;</span>
<span class="k">for</span> <span class="p">(</span><span class="bp">NSBundle</span> <span class="o">*</span><span class="n">bundle</span> <span class="k">in</span> <span class="p">[</span><span class="bp">NSBundle</span> <span class="n">allBundles</span><span class="p">])</span> <span class="p">{</span>
    <span class="c1">// @"Tests" is the name of the test target.</span>
    <span class="k">if</span> <span class="p">([[</span><span class="n">b</span> <span class="nl">objectForInfoDictionaryKey</span><span class="p">:</span><span class="s">@"CFBundleExecutable"</span><span class="p">]</span> <span class="nl">isEqualToString</span><span class="p">:</span><span class="n">testTargetName</span><span class="p">])</span> <span class="p">{</span>
        <span class="n">testsBundle</span> <span class="o">=</span> <span class="n">bundle</span><span class="p">;</span>
        <span class="k">break</span><span class="p">;</span>
    <span class="p">}</span>
<span class="p">}</span>
       
<span class="bp">NSURL</span> <span class="o">*</span><span class="n">modelURL</span> <span class="o">=</span> <span class="p">[</span><span class="bp">NSURL</span> <span class="nl">fileURLWithPath</span><span class="p">:[</span><span class="n">testsBundle</span> <span class="nl">pathForResource</span><span class="p">:</span><span class="s">@"YourModelName"</span> <span class="nl">ofType</span><span class="p">:</span><span class="s">@"momd"</span><span class="p">]];</span>
<span class="nb">self</span><span class="p">.</span><span class="n">model</span> <span class="o">=</span> <span class="p">[[[</span><span class="bp">NSManagedObjectModel</span> <span class="n">alloc</span><span class="p">]</span> <span class="nl">initWithContentsOfURL</span><span class="p">:</span><span class="n">modelURL</span><span class="p">]</span> <span class="n">autorelease</span><span class="p">];</span></code></pre>

<p>The most significant change is that we now specify the model name. We could try guessing the model name, or get the first model we find and use it. But if we guess wrong, or you're in a project with multiple modules, we're screwed. So we might as well specify it. Replace <code class="highlight">@"YourModelName"</code> with the name of the <code class="highlight">.xcdatamodel</code> or <code class="highlight">.xcdatamodeld</code> file. Off topic, but FYI: In Xcode's templates, the models is named after the project itself. It's in the Resources group.</p>

<h2>The full code</h2>

<pre><code class="highlight"><span class="c1">// Header</span>
<span class="k">@interface</span> <span class="nc">ManagedObjectContextTestHelper</span> : <span class="bp">NSObject</span> <span class="p">{</span>
<span class="p">}</span>

<span class="p">-(</span><span class="kt">id</span><span class="p">)</span><span class="nf">initWithModelName:</span><span class="p">(</span><span class="bp">NSString</span> <span class="o">*</span><span class="p">)</span><span class="nv">name</span><span class="p">;</span>

<span class="k">@property</span> <span class="p">(</span><span class="k">nonatomic</span><span class="p">,</span> <span class="k">retain</span><span class="p">)</span> <span class="bp">NSManagedObjectModel</span> <span class="o">*</span><span class="n">model</span><span class="p">;</span>
<span class="k">@property</span> <span class="p">(</span><span class="k">nonatomic</span><span class="p">,</span> <span class="k">retain</span><span class="p">)</span> <span class="bp">NSPersistentStoreCoordinator</span> <span class="o">*</span><span class="n">coordinator</span><span class="p">;</span>
<span class="k">@property</span> <span class="p">(</span><span class="k">nonatomic</span><span class="p">,</span> <span class="k">retain</span><span class="p">)</span> <span class="bp">NSPersistentStore</span> <span class="o">*</span><span class="n">store</span><span class="p">;</span>
<span class="k">@property</span> <span class="p">(</span><span class="k">nonatomic</span><span class="p">,</span> <span class="k">retain</span><span class="p">)</span> <span class="bp">NSManagedObjectContext</span> <span class="o">*</span><span class="n">context</span><span class="p">;</span>

<span class="k">@end</span>

<span class="c1">// Implementation</span>
<span class="k">@implementation</span> <span class="nc">ManagedObjectContextTestHelper</span>
<span class="k">@synthesize</span> <span class="n">model</span><span class="p">,</span> <span class="n">coordinator</span><span class="p">,</span> <span class="n">store</span><span class="p">,</span> <span class="n">context</span><span class="p">;</span>
<span class="p">-(</span><span class="kt">id</span><span class="p">)</span><span class="nf">initWithModelName:</span><span class="p">(</span><span class="bp">NSString</span> <span class="o">*</span><span class="p">)</span><span class="nv">name</span> <span class="p">{</span>
    <span class="k">static</span> <span class="bp">NSString</span> <span class="o">*</span><span class="n">testTargetName</span> <span class="o">=</span> <span class="s">@"Tests"</span><span class="p">;</span>
    
    <span class="k">if</span> <span class="p">(</span><span class="nb">self</span> <span class="o">=</span> <span class="p">[</span><span class="nb">super</span> <span class="n">init</span><span class="p">])</span> <span class="p">{</span>
        <span class="bp">NSBundle</span> <span class="o">*</span><span class="n">testsBundle</span><span class="p">;</span>
        <span class="k">for</span> <span class="p">(</span><span class="bp">NSBundle</span> <span class="o">*</span><span class="n">bundle</span> <span class="k">in</span> <span class="p">[</span><span class="bp">NSBundle</span> <span class="n">allBundles</span><span class="p">])</span> <span class="p">{</span>
            <span class="k">if</span> <span class="p">([[</span><span class="n">bundle</span> <span class="nl">objectForInfoDictionaryKey</span><span class="p">:</span><span class="s">@"CFBundleExecutable"</span><span class="p">]</span> <span class="nl">isEqualToString</span><span class="p">:</span><span class="n">testTargetName</span><span class="p">])</span> <span class="p">{</span>
                <span class="n">testsBundle</span> <span class="o">=</span> <span class="n">bundle</span><span class="p">;</span>
                <span class="k">break</span><span class="p">;</span>
            <span class="p">}</span>
        <span class="p">}</span>
        
        <span class="bp">NSURL</span> <span class="o">*</span><span class="n">modelURL</span> <span class="o">=</span> <span class="p">[</span><span class="bp">NSURL</span> <span class="nl">fileURLWithPath</span><span class="p">:[</span><span class="n">testsBundle</span> <span class="nl">pathForResource</span><span class="p">:</span><span class="n">name</span> <span class="nl">ofType</span><span class="p">:</span><span class="s">@"momd"</span><span class="p">]];</span>
        <span class="nb">self</span><span class="p">.</span><span class="n">model</span> <span class="o">=</span> <span class="p">[[[</span><span class="bp">NSManagedObjectModel</span> <span class="n">alloc</span><span class="p">]</span> <span class="nl">initWithContentsOfURL</span><span class="p">:</span><span class="n">modelURL</span><span class="p">]</span> <span class="n">autorelease</span><span class="p">];</span>
        <span class="nb">self</span><span class="p">.</span><span class="n">coordinator</span> <span class="o">=</span> <span class="p">[[[</span><span class="bp">NSPersistentStoreCoordinator</span> <span class="n">alloc</span><span class="p">]</span> <span class="nl">initWithManagedObjectModel</span><span class="p">:</span><span class="n">model</span><span class="p">]</span> <span class="n">autorelease</span><span class="p">];</span>
        <span class="nb">self</span><span class="p">.</span><span class="n">store</span> <span class="o">=</span> <span class="p">[</span><span class="n">coordinator</span> <span class="nl">addPersistentStoreWithType</span><span class="p">:</span> <span class="n">NSInMemoryStoreType</span>
                                          <span class="nl">configuration</span><span class="p">:</span> <span class="nb">nil</span>
                                                    <span class="nl">URL</span><span class="p">:</span> <span class="nb">nil</span>
                                                <span class="nl">options</span><span class="p">:</span> <span class="nb">nil</span> 
                                                  <span class="nl">error</span><span class="p">:</span> <span class="nb">NULL</span><span class="p">];</span>
        
        <span class="nb">self</span><span class="p">.</span><span class="n">context</span> <span class="o">=</span> <span class="p">[[[</span><span class="bp">NSManagedObjectContext</span> <span class="n">alloc</span><span class="p">]</span> <span class="n">init</span><span class="p">]</span> <span class="n">autorelease</span><span class="p">];</span>
        <span class="nb">self</span><span class="p">.</span><span class="n">context</span><span class="p">.</span><span class="n">persistentStoreCoordinator</span> <span class="o">=</span> <span class="n">coordinator</span><span class="p">;</span>

    <span class="p">}</span>
    
    <span class="k">return</span> <span class="nb">self</span><span class="p">;</span>
<span class="p">}</span>

<span class="p">-(</span><span class="kt">void</span><span class="p">)</span><span class="nf">dealloc</span> <span class="p">{</span>
    <span class="p">[</span><span class="n">context</span> <span class="k">release</span><span class="p">];</span>
    <span class="p">[</span><span class="n">store</span> <span class="k">release</span><span class="p">];</span>
    <span class="p">[</span><span class="n">coordinator</span> <span class="k">release</span><span class="p">];</span>
    <span class="p">[</span><span class="n">model</span> <span class="k">release</span><span class="p">];</span>
    <span class="p">[</span><span class="nb">super</span> <span class="n">dealloc</span><span class="p">];</span>
<span class="p">}</span>
<span class="k">@end</span></code></pre>
