date: 2019.12.14
title: The amazingly amazing amaze of lazy data structures
series: advent_calendar_2019

Two things makes me keep coming back to Clojure: [Persistent data structures](https://augustl.com/blog/2019/you_have_to_know_about_persistent_data_structures/) and lazy sequences.

This post is about lazy sequences.

## Lazy fibonacci

To demonstrate lazy sequences, let's implement the Fibonacci sequence.

Here's a JavaScript version of the Clojure code to follow, so you have something to compare it to.

<pre><code data-lang="javascript">
// JavaScript version, for good measure
function fib(n, xs) {
  xs = xs || [0, 1]
  
  const c = xs.length
  
  if (c < n) {
    return fib(n, xs.concat([
      xs[xs.length - 1] + xs[xs.length - 2]
    ]))
  } else {
    return xs;
  }
}

fib(10)
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
</code></pre>

Here's the Clojure version of the same code.

<pre><code data-lang="clojure">
; "Plain" version
(defn fib
  ([n] 
   (fib n [0 1]))
  ([n xs]
   (let [c (count xs)]
     (if (< c n)
       (fib n
         (conj xs 
           (+ (nth xs (- c 1))
              (nth xs (- c 2)))))
       xs))))
       
(fib 10)
; [0 1 1 2 3 5 8 13 21 34]
</code></pre>

All good, right?

Well, it's not the prettiest code in the world.

Let's fix that, by making literally the prettiest code in the world.

<pre><code data-lang="clojure">
; Lazy version - literally the prettiest 
; code in the world!
(defn fib
  ([]
   (fib 0 1))
  ([a b]
   (lazy-seq (cons a (fib b (+ a b))))))
   
(take 10 (fib))
; (0 1 1 2 3 5 8 13 21 34)
</code></pre>

Oh yass.

First of all, that's _much_ less code.

Second of all, you can make it use BigDecimals and get `(fib 100000)` super fast, with good memory usage and no stack overflow and all that jazz.

<pre><code data-lang="clojure">
; Clojure uses long by default, so make it use 
; bigdec for arbitrarily sized numbers
(defn fib
  ([]
   (fib (bigdec 0) (bigdec 1)))
  ([a b]
   (lazy-seq (cons a (fib b (+ a b))))))

(time (last (take 100000 (fib))))
; "Elapsed time: 299.1678 msecs"
; 1605285768272[...20880 digits (yes,
; really) cut for brevity]790626M
</code></pre>

That's pretty cool.

By the way, the threading macro is awesome. You use it to write statements in the order that they are called.

<pre><code data-lang="clojure">
; Plain version
(time (last (take 100000 (fib))))

; Awesome threading macro version
(->> (fib)
     (take 100000)
     (last)
     (time))
</code></pre>
    
So what actually _is_ this laziness?

Well, the whole idea is that you separate two concepts: generating data, and extracting/using data.

See how the first version had both iteration, data generation, checking if our max `n` was reached etc in the same code?

We don't need to do that with laziness.

With the lazy version, we just define what the data structure looks like. You get a "lazy sequence" back, and you can think of it as a view of an infinitely sized Fibonacci sequence, that is not actually computed until you actually ask for some data from the sequence.

So it's the call to `(take)` that actually makes something happen.

<pre><code data-lang="clojure">
; "iterate" is also lay
(take 10 (iterate inc 0))
;  (0 1 2 3 4 5 6 7 8 9)

; So is "range"
(take 10 (range -50 9000 3))
; (-50 -47 -44 -41 -38 -35 -32 -29 -26 -23)
</code></pre>

## Lazy map

This code prints absolutely nothing.

<pre><code data-lang="clojure">
(map (fn [n] (print n ""))
     [1 2 3 4 5 6 7 8 9 10])

; Nothing.. Absolutely nothing
</code></pre>

That's because `(map)` is also lazy. We have to actually get some items from it for the map function to be called.

<pre><code data-lang="clojure">
; Wait what, now?
(->> (map (fn [n] (print n "")) 
          [1 2 3 4 5 6 7 8 9 10])
     (take 3))
; 1 2 3 4 5 6 7 8 9 10
</code></pre>

Surprised? We ask for 3 items, but all 10 items seems to be printed! Is it not lazy after all?

It turns out that under the hood, Clojure will some times do a performance optimization and realize lazy sequences in batches of 32.

<pre><code data-lang="clojure">
; Batching
(->> (map (fn [n] (print n "") n)
          [1 2 3 4 5 6 7 8 9 10 11 ... 34 35 36])
     (take 3))
     
; prints
; 1 2 3 4 5 6 7 8 9 10 11 ... 30 31 32 

; returns
; (1 2 3)
</code></pre>

Note: it will run the mapping function 32 times and "pre-cache" the lazy results - but you'll still get a sequence with 3 elements in it returned from `(take)`.

But, if your source is a lazy sequence and not a vector, it won't do that.

<pre><code data-lang="clojure">
; No batching when source is lazy
(->> (map (fn [n] (print n "")) 
          (iterate inc 1))
     (take 3))

; 1 2 3
</code></pre>

## Generating PIN codes

This one is pretty cool. Let's say you want to generate N random 4 digit pin codes.

You can generate an infinite lazy sequence of random numbers:

<pre><code data-lang="clojure">
; Possible duplicates!
(->> (repeatedly #(rand-int 9999))
     (take 5))

; (643 6000 483 8668 7493)
</code></pre>

But this list can contain duplicates! The chances are low when you just get 5 items obviously, but that doesn't matter - our requirement was that the list should be unique.

Enter the awesomeness of `(distinct)`. That function will take a list, and return a list with no duplicates - _and it is lazy!_

<pre><code data-lang="clojure">
; No duplicates!
(->> (repeatedly #(rand-int 9999))
     (distinct)
     (take 5)
     ; Also format it, for good measure
     (map #(format "%04d" %)))

; ("6856" "3461" "8833" "4884" "0004")
</code></pre>

So good. So, so very good.