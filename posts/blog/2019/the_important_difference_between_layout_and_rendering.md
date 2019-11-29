date: 2019.12.07
title: The important difference between layout and rendering
series: advent_calendar_2019
unlisted: true

Layout and rendering reminds me of variable names in math. What the heck is "c"? Well, that's the speed of light, obviously! And what about "L"? Angular momentum, silly! THere's a [whole list of these](https://en.wikipedia.org/wiki/List_of_letters_used_in_mathematics_and_science).

Different rendering engines might have different names for these. But the concept of separating layout and rendering exists in every rendering engine I'm aware of.

Let's see how this works, using the web as an example.

## How to cause "layout"

Allright, we have a div.

<pre><code data-lang="html">
<div>hai</div>
</code></pre>

Nothing special about it.

Let's give it a margin.

<pre><code data-lang="html">
<div style="margin-left: 20px;">hai</div>
</code></pre>

And BOOM, the browser has to do a "layout" pass.

Why?

Well, setting the margin affects the layout. Obviously.

Put differently: setting the margin on an element can cause another completely unrelated element to _also_ have to change _its_ layout.

For example, let's say your actual full HTML looks like this:

<pre><code data-lang="html">
<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: green; display: inline-block;">
    hai
  </div>
</div>
</code></pre>

It looks like this:

<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: green; display: inline-block;">
    hai
  </div>
</div>

<p></p>

Then we add a margin.

<pre><code data-lang="html">
<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: green; display: inline-block; margin-left: 20px;">
    hai
  </div>
</div>
</code></pre>

Which then looks like this:

<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">foo</div>
  <div style="background: green; display: inline-block; margin-left: 20px;">hai</div>
</div>

<p></p>

See?

We added a margin to the green box, but that caused the browser to make the red box larger.

What if we had another box around that?

And then another box aroudn that?

And then maybe a sidebar somewhere, that now moved a little bit?

See where this is going?

So if you try to do something crazy, like changing the "margin" property of an element in JavaScript and hoping to achieve anything that looks even slightly like a smooth animation, you're out of luck. Not gonna happen.

This is the "latout" phase. It's the expensive part.

## How to cause "rendering"

Short answer: you don't cause it. It happens all the time.

It's true!

60 times every second, your entire UI is rendered, from scratch. _All_ of it.

The browser is _finished_ with the layout. It knows the size of all the boxes, where they should be on the page, and all that jazz.

So rendering it, or painting it, as it's often called with affection, is super fast, because that's something the GPU does.

Typically, each box or section of your GUI has ended up as a texture in OpenGL or something like that. Your GPU will then just take all of these textures, and paint them in the correct position on the screen. The GPU is _really super ultra fast_ at doing this.

That's why a simple "rendering" is fast.

## Why does that matter? 

Good question.

The answer: **Some operations only requires a new rendering phase.**

This is super important. Your buttery smooth 60 fps animations, for example, absolutely most certainly do _not_ want to cause a new layout. You just want to tweak the rendering.

There are two main ways of doing that.

## Creating a new texture

Let's say you have the divs from above:

<pre><code data-lang="html">
<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: green; display: inline-block; margin-left: 20px;">
    hai
  </div>
</div>
</code></pre>

Which then looks like this:

<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">foo</div>
  <div style="background: green; display: inline-block; margin-left: 20px;">hai</div>
</div>

<p></p>

All we want to do, is to change the color on one of them, from <span style="color: #fff; background-color: green">Ugly Web Green</span> to <span style="color: #fff; background-color: blue">Ugly Web Blue</span>.

<pre><code data-lang="html">
<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: blue; display: inline-block; margin-left: 20px;">
    hai
  </div>
</div>
</code></pre>

<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">foo</div>
  <div style="background: blue; display: inline-block; margin-left: 20px;">hai</div>
</div>

<p></p>

The browser knows that there is absolutely no way that changing the background-color of an element needs a new layout. So all it has to do, is to create a new texture for that specific div, and then just do a new rendering. Now, generating the texture has the potential of being somewhat expensive. But it's _nothing_ compared to a full layout, which we promptly avoided just now.

## Tweaking the texture 

Now, CSS has a separate property for just affecting the rendering stage. Let's move a box, without causing layout!

<pre><code data-lang="html">
<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="transform: translate(20px, -5px); background: blue; display: inline-block; margin-left: 20px;">
    hai
  </div>
</div>
</code></pre>

<div style="width: 200px; background: red;">
  <div style="background: yellow; display: inline-block; width: 160px;">foo</div>
  <div style="background: blue; display: inline-block; margin-left: 20px; transform: translate(20px, -5px)">hai</div>
</div>

<p></p>

We only changed the "transform" property. Notice how it moves without affecting the layout at all? That's because it doesn't affect the layout - by design.

It's super fast, because it's only the GPU that has to care.

When everything is rendered, it gets the result of the layout that was performed earlier, to see where everything should be positioned.

Then, it applies the transform _at the GPU level_ to the texture. If it's something a GPU can do fast, it's applying transforms. It's the specialty of a GPU. 

So that's almost like not doing any extra work at all as far as the GPU is concerned. It just takes the existing texture, positions it based on the existing layout information, and performs a super cheap transform to figure out where to draw it.


## Allright!

So now you know why it's important to know the difference between layout and rendering!

