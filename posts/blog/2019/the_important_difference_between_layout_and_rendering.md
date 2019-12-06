date: 2019.12.06
title: The important difference between layout and rendering
series: advent_calendar_2019

Layout and rendering reminds me of variable names in math. What the heck is "c"? Well, that's the speed of light, obviously! And what about "L"? Angular momentum, silly! There's a [whole list of these](https://en.wikipedia.org/wiki/List_of_letters_used_in_mathematics_and_science).

Different rendering engines might have different names for these. But the concept of separating layout and rendering exists in every rendering engine I'm aware of.

Let's see how this works, using the web and HTML as an example.

## How to cause "layout" in plain old HTML

Allright, we have a div, with plain old HTML. No JavaScript, no React.

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

Because another completely unrelated element might _also_ have to change _its_ layout when you change a margin.

For example, let's say your actual full HTML looks like this:

<pre><code data-lang="html">
<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: #92140c; display: inline-block;">
    hai
  </div>
</div>
</code></pre>

It looks like this:

<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: #92140c; display: inline-block;">
    hai
  </div>
</div>

<p></p>

Then we add a margin.

<pre><code data-lang="html">
<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: #92140c; display: inline-block; margin-left: 20px;">
    hai
  </div>
</div>
</code></pre>

Which then looks like this:

<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">foo</div>
  <div style="background: #92140c; display: inline-block; margin-left: 20px;">hai</div>
</div>

<p></p>

See?

A different element on the page had to change! The surrounding grey box in the background had to be made larger.

And we didn't change anything on that box.

What if we had another box around that?

And then another box around that?

And then maybe a sidebar somewhere, that now moved a little bit?

See where this is going?

If you try to animate an element smoothly using "margin", you're out of luck. Every time you change the margin, the browser has to check a lot of extra stuff to see what else has to be rendered as well as the element that you changed.

This is the "layout" phase. It's the expensive part.

## How to cause "rendering" on the web

Short answer: you don't cause it. It happens all the time.

It's true!

Under the hood, your entire UI is rendered, 60 times every second, from scratch. _All_ of it.

The browser uses the cached layout structure when rendering, so the browser knows the size of all the boxes, where they should be on the page, and all that jazz.

Typically, each box or section of your GUI has ended up as a texture in OpenGL or Metal or something like that. Your GPU will then paint the textures in the correct position on the screen. 

The GPU is _really super ultra fast_ at doing this.

That's why "rendering" is fast.

## Why does that matter? 

Good question.

If you want rendering to be fast, you got to ask yourself:

* Does this cause full layout?
* Or does it just cause a new render with the existing laout?

This is super important. Your buttery smooth 60 fps animations does _not_ want to cause a new layout. You just want to tweak the rendering.

There are two main ways of doing that.

## Creating a new texture

Let's say you have the divs from above:

<pre><code data-lang="html">
<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: #92140c; display: inline-block; margin-left: 20px;">
    hai
  </div>
</div>
</code></pre>

Which then looks like this:

<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">foo</div>
  <div style="background: #92140c; display: inline-block; margin-left: 20px;">hai</div>
</div>

<p></p>

All we want to do, is to change the color on one of them, from <span style="color: #fff; background-color: #92140c">Pretty Smooth Red</span> to <span style="color: #fff; background-color: blue">Ugly Web Blue</span>.

<pre><code data-lang="html">
<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="background: blue; display: inline-block; margin-left: 20px;">
    hai
  </div>
</div>
</code></pre>

<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">foo</div>
  <div style="background: blue; display: inline-block; margin-left: 20px;">hai</div>
</div>

<p></p>

The browser knows that there is absolutely no way that changing the background-color of an element needs a new layout. So all it has to do, is to create a new texture for that specific div, and then just do a new rendering. Now, generating the texture has the potential of being somewhat expensive. But it's _nothing_ compared to a full layout, which we promptly avoided just now.

## Tweaking the texture 

Now, CSS has a separate property for just affecting the rendering stage. Let's move a box, without causing layout!

<pre><code data-lang="html">
<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">
    foo
  </div>
  <div style="transform: translate(20px, -5px); background: blue; display: inline-block; margin-left: 20px;">
    hai
  </div>
</div>
</code></pre>

<div style="width: 200px; background: #c1b4ae;">
  <div style="background: #be5a38; display: inline-block; width: 160px;">foo</div>
  <div style="background: blue; display: inline-block; margin-left: 20px; transform: translate(20px, -5px)">hai</div>
</div>

<p></p>

We only changed the "transform" property. Notice how it moves without affecting the layout at all? That's because it doesn't affect the layout - by design.

It's super fast, because it's only the GPU that has to care.

When everything is rendered, it gets the result of the layout that was performed earlier, to see where everything should be positioned.

Then, it applies the transform _at the GPU level_ to the texture. If it's something a GPU can do fast, it's applying transforms. It's the specialty of a GPU. 

So that's almost like not doing any extra work at all as far as the GPU is concerned. It just takes the existing texture, positions it based on the existing layout information, and performs a super cheap transform to figure out where to draw it.


## Not just the web

I use web and HTML as an example here, but all rendering engines that I'm familiar with employs techniques like this.

The terminology might not be the same in all of them, but the principle is there. Figuring out where to put stuff is much different than just rendering it after that has been figured out.

Now you know!