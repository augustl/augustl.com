date: 2019.12.05
title: You have to know about persistent data structures
series: advent_calendar_2019
unlisted: true

The first thing I look for when checking out a new programming language is immutable persistent data structures. This is an injury I've gotten from Clojure, which has them out of the box. I tend to structure my whole app around these kinds of data structures. They are smart, fast, efficient, immutable and amazing.

In this post, I'll try to make you feel the same way about them.

## Axiom: immutability is good

I'm not going to try to sell this one. Because it's a tough sell.

By that I mean that I and most people I know absolutely love immutable stuff. I know a few people that don't, and I have no idea how to sell it to them. And why they don't like immutable stuff.

If you don't like immutable values, then you can probably stop reading now. However, if you, like me, like to fundamentally eliminate a whole category of bugs from your code, then read on!

(Sorry. I don't want to trash talk those who don't like immutability. But I just don't get it.)

## The problem with immutable values is that they're immutable

## Copy on write - nah

I mean, I'm not gonna diss copy on write completely. There does exist some mildly useful software that leverages it, such as the Linux Kernel.

The whole central and important concept of forking a process in Linux/Unix, relies on copy on write (CoW). When you have a process that uses 11GB of RAM, and you fork it, you have a new process, identical to the original one, with its own copy of the 11GB of RAM. To make the process of forking not horribly tear-inducingly slow, the kernel relies on CoW. The action of forking doesn't actually do anything to those 11GBs of RAM. It's only when you start writing to memory from the fork, that the kernel starts copying and then writing - copy on write - the memory of the original process.

CoW is technically speaking a type of persistent data structure.

INSERT GRAPHIC HERE

However, CoW is at its most useful when the data is mutable. When your data is immutable to the core, you have another option.

That other option is...

## Structural sharing - yass

Now _this_ is my kind of persistent data structure.

Allright. So we have this huge data structure. We know that it is immutable. We want to change one little piece of it. What optimization can we run on this process?

Do you see it yet?

The old data structure _is immutable_. We can just use that!

INSERT GRAPHIC HERE