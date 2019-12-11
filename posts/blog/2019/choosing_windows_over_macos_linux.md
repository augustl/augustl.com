date: 2019.12.11
title: Why I ditched macOS, Linux, and chose Windows for development work
series: advent_calendar_2019

I’ve already told you the ["how"](https://augustl.com/blog/2019/set_up_win10_dev_environment_for_macos_linux_users/). Now it’s time for the "why".

## Actually, I don’t care what you use

I just wanted to get this one out of the way. I have absolutely nothing against the use of macOS or Linux. Personal preferences are both _normal_ and _OK_.

I’ve used all of them, extensively. My gaming PC is Windows. I've had many Macs. I've ran Linux on a Mac. I've had Thinkpads and Dells with Linux. I have switched to Windows before, and ended up switching back. Maybe that will happen again in the future. Those that know me, laugh at the idea that I started that sentence with "maybe".

What has changed?

## The big thing that is different now is WSL.

I live in a unix world. All the servers I deploy to are unix. The software platforms I choose - Clojure, Kotlin, and other JVM languages - have one thing in common:

They're mostly used by people that use Linux or macOS. 

So you're bound to run into problems on Windows. It's getting pretty rare, but it does happen. For example, a couple of years ago, I tried to compile ClojureScript on Windows, and it failed because of the way it shelled out to call npm for installing npm module dependencies. Almost nobody combines Windows and ClojureScript, at least two years ago. So my guess is that it simply never occurred to anyone to test it on Windows. It's fixed now. And you can sort of blame the JVM APIs that shelling out isn't made cross platform compatible. But the point remains the same. It'll happen.

But because of WSL, this is now a thing of the past.

## WSL seals the deal

WSL is short for Windows Subsystem for Linux. It's a complete re-implementation of the Linux kernel system calls, against the NT kernel.

Think of it as the business version of WINE, that lets you run Windows programs on Linux. Just much, much better.

There has always been Cygwin. And I don't think I know anyone that uses Windows that didn't use to use Cygwin before WSL came along. But WSL is so much better than Cygwin.

I won't go into detail about how WSL works here, I'll save that for a separate blog post.

But suffice to say, WSL rocks. It's a proper Linux run-time, with no boot time, embedded right into Windows. And you can choose between a bunch of distros, so you have the Ubuntu `apt-get` repos right at your fingertips if you choose Ubuntu, for example. That's a world of difference from cygwin.

For example, last week I needed imagemagick with the extensions for reading the Apple camera file format HEIF. I just used apt to get the build-deps for imagemagick and built it myself with the necessary flags for HEIF support. Good luck doing that on cygwin.

I try to do most things directly on Windows, to get the hang of it. There are some things, though, such as curl, that I have absolutely no idea how to do on Windows. I just open a WSL shell and use curl. Real curl. On Linux. On Windows.

## Windows has a good terminal now

This is a half truth. For ages, there's been [cmdr](https://cmder.net), and it works great. The option menus looks like someone used an AI to convert config files and option flags to a GUI, and it does require some setup.

So now, I'm using the [new official terminal from Microsoft](https://www.microsoft.com/en-us/p/windows-terminal-preview/9n0dx20hk701), which is in early access and available for anyone to try. I've used it for more than two months now and haven't had a single issue, so it's as good as stable in my book.
It's nice to be able to use ctrl+shift+c to copy, instead of having to do the weird right click insert enter stuff that I never quite got the hang of in the old built-in terminal in 
Windows. It's [even open source](https://github.com/Microsoft/Terminal) - you can build it yourself!

## I don't like Apple hardware

The new 16" Macbook Pro is a step in the right direction.
But since 2015, Macbook Pro has been pretty much useless as far as I'm concerned. I don't like that lock-in.

I mean, I guess someone sees my Dell XPS 15 laptop and thinks "wow, poor guy, he doesn't have a touch bar" before they think anything else. But that person sure aint me. And I like that it has a thunderbolt 3 port for connecting my dock so I can just attach one single cable when I arrive at work. And that it also has USB-A ports and a HDMI port.

And I have a gamer gene. I like to have a wide variety of hardrware available, and I read news about the latest offerings from AMD and Intel. Have you seen the [latest episodes from LinusTechTips](https://www.youtube.com/watch?v=WxocVricANg) about this? Do you want to rely on Apple and hope they make laptops with AMD CPUs in them? I mean maybe it will happen. But I like to not have to rely on one single company for my hardware.

## I'm not a huge fan of the window management in macOS

Have you noticed that we're purely in the domain of taste now? Don't blame me! I said it in the intro. Your taste can be different from mine.

I really like that I can just hold the Windows key and press arrow up to maximize a window. And maximize means "fill the screen", not "whatever the developers of the app want".

One of my main gripes with macOS is that Command+tab switches between apps and not Windows. I have multiple windows of IntelliJ open at the same time, and I might have an incognito window of Firefox open to test some login stuff, and I want to switch betwen those two windows. And some times I work with two IntelliJ windows and one Firefox window sort of kind of at the same time. Then I want to have those in the glorious and predictable LRU cache that is alt+tab on Windows.

This is a pretty minor gripe. But it is actually quite annoying when I prefer the way Windows does it, and I'm constantly reminded that apparently macOS isn't made for people like me.
There are some plugins I found that makes Command+tab switch between windows, not apps. The best one I found shows a preview of the window contents that can be many minutes old, so I think I have an unread message in Slack, but then I saw that it was just an old preview I had in Command+tab. And every now and then, it just didn't show all the windows I had open.

Meh.

## I don't particularly like the state of software on Linux

Heck, even Linus Torvalds agrees (6:27).

<iframe width="560" height="315" src="https://www.youtube.com/embed/5PmHRSeA2c8?start=387" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

I make a podcast, and i use Ableton Live to edit that. Ableton Live exists for macOS and Windows. That's it.

I somehow managed to set up Ubuntu wrong once, and set up an encrypted home folder instead of a fully encrypted disk. Because Linux, this is two completely different things, and Dropbox suddenly changed to support the latter, and not the former.

The issue, as Linus mentions above, is that there's no such thing as "linux". If you make software, you have to distribute  it for Ubuntu, Debian, Fedora 23, Fedora 24, CentOS, Arch, ... The list goes on and on.

## This post is not meant to persuade you

A long list of reasons that are mostly subjective is not very persuasive. And that's OK. I just wanted to tell you about why I chose Windows, that's all.

You can check out my article on [how to set up a Windows development environment](https://augustl.com/blog/2019/set_up_win10_dev_environment_for_macos_linux_users/) if you want to!