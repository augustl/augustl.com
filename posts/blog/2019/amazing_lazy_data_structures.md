---
title: "The amazingly amazing amaze of lazy data structures"
date: "2019-12-14"
content_format: "markdown"
archive_order: 7
series: "advent_calendar_2019"
---
Two things makes me keep coming back to Clojure: [Persistent data structures](https://augustl.com/blog/2019/you_have_to_know_about_persistent_data_structures/) and lazy sequences.

This post is about lazy sequences.

## Lazy fibonacci

To demonstrate lazy sequences, let's implement the Fibonacci sequence.

Here's a JavaScript version of the Clojure code to follow, so you have something to compare it to.

<pre><code class="highlight"><span class="c1">// JavaScript version, for good measure</span>
<span class="kd">function</span> <span class="nx">fib</span><span class="p">(</span><span class="nx">n</span><span class="p">,</span> <span class="nx">xs</span><span class="p">)</span> <span class="p">{</span>
  <span class="nx">xs</span> <span class="o">=</span> <span class="nx">xs</span> <span class="o">||</span> <span class="p">[</span><span class="mi">0</span><span class="p">,</span> <span class="mi">1</span><span class="p">]</span>
  
  <span class="kr">const</span> <span class="nx">c</span> <span class="o">=</span> <span class="nx">xs</span><span class="p">.</span><span class="nx">length</span>
  
  <span class="k">if</span> <span class="p">(</span><span class="nx">c</span> <span class="o">&lt;</span> <span class="nx">n</span><span class="p">)</span> <span class="p">{</span>
    <span class="k">return</span> <span class="nx">fib</span><span class="p">(</span><span class="nx">n</span><span class="p">,</span> <span class="nx">xs</span><span class="p">.</span><span class="nx">concat</span><span class="p">([</span>
      <span class="nx">xs</span><span class="p">[</span><span class="nx">xs</span><span class="p">.</span><span class="nx">length</span> <span class="o">-</span> <span class="mi">1</span><span class="p">]</span> <span class="o">+</span> <span class="nx">xs</span><span class="p">[</span><span class="nx">xs</span><span class="p">.</span><span class="nx">length</span> <span class="o">-</span> <span class="mi">2</span><span class="p">]</span>
    <span class="p">]))</span>
  <span class="p">}</span> <span class="k">else</span> <span class="p">{</span>
    <span class="k">return</span> <span class="nx">xs</span><span class="p">;</span>
  <span class="p">}</span>
<span class="p">}</span>

<span class="nx">fib</span><span class="p">(</span><span class="mi">10</span><span class="p">)</span>
<span class="c1">// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]</span></code></pre>

Here's the Clojure version of the same code.

<pre><code class="highlight"><span class="c1">; "Plain" version</span>
<span class="p">(</span><span class="kd">defn </span><span class="nv">fib</span>
  <span class="p">([</span><span class="nv">n</span><span class="p">]</span> 
   <span class="p">(</span><span class="nf">fib</span> <span class="nv">n</span> <span class="p">[</span><span class="mi">0</span> <span class="mi">1</span><span class="p">]))</span>
  <span class="p">([</span><span class="nv">n</span> <span class="nv">xs</span><span class="p">]</span>
   <span class="p">(</span><span class="k">let </span><span class="p">[</span><span class="nv">c</span> <span class="p">(</span><span class="nb">count </span><span class="nv">xs</span><span class="p">)]</span>
     <span class="p">(</span><span class="k">if </span><span class="p">(</span><span class="nb">&lt; </span><span class="nv">c</span> <span class="nv">n</span><span class="p">)</span>
       <span class="p">(</span><span class="nf">fib</span> <span class="nv">n</span>
         <span class="p">(</span><span class="nb">conj </span><span class="nv">xs</span> 
           <span class="p">(</span><span class="nb">+ </span><span class="p">(</span><span class="nb">nth </span><span class="nv">xs</span> <span class="p">(</span><span class="nb">- </span><span class="nv">c</span> <span class="mi">1</span><span class="p">))</span>
              <span class="p">(</span><span class="nb">nth </span><span class="nv">xs</span> <span class="p">(</span><span class="nb">- </span><span class="nv">c</span> <span class="mi">2</span><span class="p">)))))</span>
       <span class="nv">xs</span><span class="p">))))</span>
       
<span class="p">(</span><span class="nf">fib</span> <span class="mi">10</span><span class="p">)</span>
<span class="c1">; [0 1 1 2 3 5 8 13 21 34]</span></code></pre>

All good, right?

Well, it's not the prettiest code in the world.

Let's fix that, by making literally the prettiest code in the world.

<pre><code class="highlight"><span class="c1">; Lazy version - literally the prettiest </span>
<span class="c1">; code in the world!</span>
<span class="p">(</span><span class="kd">defn </span><span class="nv">fib</span>
  <span class="p">([]</span>
   <span class="p">(</span><span class="nf">fib</span> <span class="mi">0</span> <span class="mi">1</span><span class="p">))</span>
  <span class="p">([</span><span class="nv">a</span> <span class="nv">b</span><span class="p">]</span>
   <span class="p">(</span><span class="nf">lazy-seq</span> <span class="p">(</span><span class="nb">cons </span><span class="nv">a</span> <span class="p">(</span><span class="nf">fib</span> <span class="nv">b</span> <span class="p">(</span><span class="nb">+ </span><span class="nv">a</span> <span class="nv">b</span><span class="p">))))))</span>
   
<span class="p">(</span><span class="nb">take </span><span class="mi">10</span> <span class="p">(</span><span class="nf">fib</span><span class="p">))</span>
<span class="c1">; (0 1 1 2 3 5 8 13 21 34)</span></code></pre>

Oh yass.

First of all, that's _much_ less code.

Second of all, you can make it use BigDecimals and get `(fib 100000)` super fast, with good memory usage and no stack overflow and all that jazz.

<pre><code class="highlight"><span class="c1">; Clojure uses long by default, so make it use </span>
<span class="c1">; bigdec for arbitrarily sized numbers</span>
<span class="p">(</span><span class="kd">defn </span><span class="nv">fib</span>
  <span class="p">([]</span>
   <span class="p">(</span><span class="nf">fib</span> <span class="p">(</span><span class="nf">bigdec</span> <span class="mi">0</span><span class="p">)</span> <span class="p">(</span><span class="nf">bigdec</span> <span class="mi">1</span><span class="p">)))</span>
  <span class="p">([</span><span class="nv">a</span> <span class="nv">b</span><span class="p">]</span>
   <span class="p">(</span><span class="nf">lazy-seq</span> <span class="p">(</span><span class="nb">cons </span><span class="nv">a</span> <span class="p">(</span><span class="nf">fib</span> <span class="nv">b</span> <span class="p">(</span><span class="nb">+ </span><span class="nv">a</span> <span class="nv">b</span><span class="p">))))))</span>

<span class="p">(</span><span class="nb">time </span><span class="p">(</span><span class="nb">last </span><span class="p">(</span><span class="nb">take </span><span class="mi">100000</span> <span class="p">(</span><span class="nf">fib</span><span class="p">))))</span>
<span class="c1">; "Elapsed time: 299.1678 msecs"</span>
<span class="c1">; 1605285768272[...20880 digits (yes,</span>
<span class="c1">; really) cut for brevity]790626M</span></code></pre>

That's pretty cool.

By the way, the threading macro is awesome. You use it to write statements in the order that they are called.

<pre><code class="highlight"><span class="c1">; Plain version</span>
<span class="p">(</span><span class="nb">time </span><span class="p">(</span><span class="nb">last </span><span class="p">(</span><span class="nb">take </span><span class="mi">100000</span> <span class="p">(</span><span class="nf">fib</span><span class="p">))))</span>

<span class="c1">; Awesome threading macro version</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nf">fib</span><span class="p">)</span>
     <span class="p">(</span><span class="nb">take </span><span class="mi">100000</span><span class="p">)</span>
     <span class="p">(</span><span class="nf">last</span><span class="p">)</span>
     <span class="p">(</span><span class="nf">time</span><span class="p">))</span></code></pre>
    
So what actually _is_ this laziness?

Well, the whole idea is that you separate two concepts: generating data, and extracting/using data.

See how the first version had both iteration, data generation, checking if our max `n` was reached etc in the same code?

We don't need to do that with laziness.

With the lazy version, we just define what the data structure looks like. You get a "lazy sequence" back, and you can think of it as a view of an infinitely sized Fibonacci sequence, that is not actually computed until you actually ask for some data from the sequence.

So it's the call to `(take)` that actually makes something happen.

<pre><code class="highlight"><span class="c1">; "iterate" is also lay</span>
<span class="p">(</span><span class="nb">take </span><span class="mi">10</span> <span class="p">(</span><span class="nb">iterate inc </span><span class="mi">0</span><span class="p">))</span>
<span class="c1">;  (0 1 2 3 4 5 6 7 8 9)</span>

<span class="c1">; So is "range"</span>
<span class="p">(</span><span class="nb">take </span><span class="mi">10</span> <span class="p">(</span><span class="nb">range </span><span class="mi">-50</span> <span class="mi">9000</span> <span class="mi">3</span><span class="p">))</span>
<span class="c1">; (-50 -47 -44 -41 -38 -35 -32 -29 -26 -23)</span></code></pre>

## Lazy map

This code prints absolutely nothing.

<pre><code class="highlight"><span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">n</span><span class="p">]</span> <span class="p">(</span><span class="nb">print </span><span class="nv">n</span> <span class="s">""</span><span class="p">))</span>
     <span class="p">[</span><span class="mi">1</span> <span class="mi">2</span> <span class="mi">3</span> <span class="mi">4</span> <span class="mi">5</span> <span class="mi">6</span> <span class="mi">7</span> <span class="mi">8</span> <span class="mi">9</span> <span class="mi">10</span><span class="p">])</span>

<span class="c1">; Nothing.. Absolutely nothing</span></code></pre>

That's because `(map)` is also lazy. We have to actually get some items from it for the map function to be called.

<pre><code class="highlight"><span class="c1">; Wait what, now?</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">n</span><span class="p">]</span> <span class="p">(</span><span class="nb">print </span><span class="nv">n</span> <span class="s">""</span><span class="p">)</span> <span class="nv">n</span><span class="p">)</span> 
          <span class="p">[</span><span class="mi">1</span> <span class="mi">2</span> <span class="mi">3</span> <span class="mi">4</span> <span class="mi">5</span> <span class="mi">6</span> <span class="mi">7</span> <span class="mi">8</span> <span class="mi">9</span> <span class="mi">10</span><span class="p">])</span>
     <span class="p">(</span><span class="nb">take </span><span class="mi">3</span><span class="p">))</span>
     
<span class="c1">; prints</span>
<span class="c1">; 1 2 3 4 5 6 7 8 9 10</span>

<span class="c1">; returns</span>
<span class="c1">; (1 2 3)</span></code></pre>

Surprised? We ask for 3 items, but all 10 items seems to be printed! Is it not lazy after all?

It turns out that under the hood, Clojure will some times do a performance optimization and realize lazy sequences in batches of 32.

<pre><code class="highlight"><span class="c1">; Batching</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">n</span><span class="p">]</span> <span class="p">(</span><span class="nb">print </span><span class="nv">n</span> <span class="s">""</span><span class="p">)</span> <span class="nv">n</span><span class="p">)</span>
          <span class="p">[</span><span class="mi">1</span> <span class="mi">2</span> <span class="mi">3</span> <span class="mi">4</span> <span class="mi">5</span> <span class="mi">6</span> <span class="mi">7</span> <span class="mi">8</span> <span class="mi">9</span> <span class="mi">10</span> <span class="mi">11</span> <span class="nv">...</span> <span class="mi">34</span> <span class="mi">35</span> <span class="mi">36</span><span class="p">])</span>
     <span class="p">(</span><span class="nb">take </span><span class="mi">3</span><span class="p">))</span>
     
<span class="c1">; prints</span>
<span class="c1">; 1 2 3 4 5 6 7 8 9 10 11 ... 30 31 32 </span>

<span class="c1">; returns</span>
<span class="c1">; (1 2 3)</span></code></pre>

Note: it will run the mapping function 32 times and "pre-cache" the lazy results - but you'll still get a sequence with 3 elements in it returned from `(take)`.

But, if your source is a lazy sequence and not a vector, it won't do that.

<pre><code class="highlight"><span class="c1">; No batching when source is lazy</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nb">map </span><span class="p">(</span><span class="k">fn </span><span class="p">[</span><span class="nv">n</span><span class="p">]</span> <span class="p">(</span><span class="nb">print </span><span class="nv">n</span> <span class="s">""</span><span class="p">)</span> <span class="nv">n</span><span class="p">)</span> 
          <span class="p">(</span><span class="nb">iterate inc </span><span class="mi">1</span><span class="p">))</span>
     <span class="p">(</span><span class="nb">take </span><span class="mi">3</span><span class="p">))</span>

<span class="c1">; prints</span>
<span class="c1">; 1 2 3</span>

<span class="c1">; returns</span>
<span class="c1">; (1 2 3)</span></code></pre>

## Generating PIN codes

This one is pretty cool. Let's say you want to generate N random 4 digit pin codes.

You can generate an infinite lazy sequence of random numbers:

<pre><code class="highlight"><span class="c1">; Possible duplicates!</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nf">repeatedly</span> <span class="o">#</span><span class="p">(</span><span class="nb">rand-int </span><span class="mi">9999</span><span class="p">))</span>
     <span class="p">(</span><span class="nb">take </span><span class="mi">5</span><span class="p">))</span>

<span class="c1">; (643 6000 483 8668 7493)</span></code></pre>

But this list can contain duplicates! The chances are low when you just get 5 items obviously, but that doesn't matter - our requirement was that the list should be unique.

Enter the awesomeness of `(distinct)`. That function will take a list, and return a list with no duplicates - _and it is lazy!_

<pre><code class="highlight"><span class="c1">; No duplicates!</span>
<span class="p">(</span><span class="nf">-&gt;&gt;</span> <span class="p">(</span><span class="nf">repeatedly</span> <span class="o">#</span><span class="p">(</span><span class="nb">rand-int </span><span class="mi">9999</span><span class="p">))</span>
     <span class="p">(</span><span class="nf">distinct</span><span class="p">)</span>
     <span class="p">(</span><span class="nb">take </span><span class="mi">5</span><span class="p">)</span>
     <span class="c1">; Also format it, for good measure</span>
     <span class="p">(</span><span class="nb">map </span><span class="o">#</span><span class="p">(</span><span class="nf">format</span> <span class="s">"%04d"</span> <span class="nv">%</span><span class="p">)))</span>

<span class="c1">; ("6856" "3461" "8833" "4884" "0004")</span></code></pre>

So good. So, so very good.
