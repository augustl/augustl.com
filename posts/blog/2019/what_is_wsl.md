date: 2019.12.13
title: What is WSL, and how can it possibly even?
series: advent_calendar_2019

Some of the other posts in my 2019 blog advent calendar has been about Windows. They all mention WSL. In this post, I'll focus only on WSL, and what it's all about, and how it works, and all that jazz.

## What is WSL?

WSL is short for Windows Subsystem for Linux.

It's a Linux, made for your Windows.

Think of it like WINE, but the other way around. It's a thing that lets you run Linux software on Windows.

And it's _so good_.

## WSL is what enables Windows for me

As I've [blogged about before](https://augustl.com/blog/2019/choosing_windows_over_macos_linux/), I've switched to Windows for my main development environment. The presence of WSL is the main enabler of this swap.

The issue for me is that every now and then, you'll come across software that just doesn't run well on Windows. This is almost never because of Windows itself, but because the developer community of which I'm a part tend to use use macOS or Linux. So they just haven't bothered running their software Windows. 

I can't blame them.

So what do you do? Raise your hands, look at a nearby cloud, and yell at it?

No, you just run it in WSL.

## So what is WSL exactly

WSL is a _full re-implementation of the Linux kernel_ against the NT kernel.

In case you didn't know, NT used to be a version of windows, but it's actually the name of the kernel itself. It's powering Windows, X-Box, Windows Mobile, Windows Server, and Hololens.

Why is that cool?

One of the main problems with porting unix software to Windows, is that forking is incredibly slow. `fork()` is a very common system call do to on Linux and macOS. It creates a copy of the process that called `fork()`, and starts running it immediately. It uses fancy copy-on-write semantics on the RAM they share, etc. Windows _has_ forking, but it has plenty of overhead. Windows was _not_ designed for fast process creation, so it's pretty resource intensive.

But the NT kernel itself does not have this problem. It's solely a problem in the Windows API layer. A process in NT is super light weight.

So since WSL implements all the Linux system calls (like `fork()`) directly against NT, it's able to bypass the Windows stuff and make it super fast and lightweight!

This is one of the things that makes WSL _much_ better than Cygwin. Cygwin provided the same sort of API that WSL does -  ish. And that's a pretty big "ish". You had to re-compile the software against Cygwin, you couldn't just run native Linux binaries. And Cygwin implemented their calls against Win32, not the NT kernel.

WSL runs the existing Linux binaries that are already compiled for Linux. And runs them much faster.

## Do you want some `apt-get` with that?

The other really cool thing, is that WSL is not just a kernel. It's actually a full distro.

_Multiple_ distros, in fact.

At the time of writing, you can choose Ubuntu 16.04 LTS, Ubuntu 18.04 LTS, Fedora, OpenSUSE, Debian, Alpine and a few others.

So you can install all the extra software you need with `apt-get` (or yum, or whatever, depending on your distro of choice).

For example, the other day I needed to convert an Apple iOS camera file in the HEIF format to jpg files. ImageMagic in apt doesn't have that, so I used apt to get the build-deps for ImageMagic, downloaded the sources, and compiled ImageMagic myself with just a handful of commands, with HEIF support enabled.

Good luck doing that easily under Windows (without WSL) or Cygwin.

## I gotta admit something

There's one thing I never checked: How easy it is to compile ImageMagic on Windows. Maybe my point above is moot?
 
But who cares!

I don't _have_ to figure that out, I already know how to do it on Linux, which means I know how to do it on WSL.

And I'm sure that there are cases when doing something with `apt` is much easier than doing it directly on Windows itself.

`curl` is a good example. I usually need `curl` when there's some kind of emergenzy. "The thing is down, go check the thing!!". At that point I don't have the mental resources needed to be able to figure out how to do that in PowerShell. I do actually use PowerShell for most things, but not all things. I can just open a WSL terminal, with zero startup time, and do a good old `curl`.

Because why not?

## And it feels really _really_ native

If I start a server in Linux and bind it to port 3001, I can go to localhost:3001 in a browser in Windows, and it just works.

This is why it's amazing to not have any virtualization layer between me and Linux. It's all running against the same kernel, so when WSL calls NT that binds port 3001, it binds port 3001 for both Windows and WSL, just like that.

If you're so inclined, you can even get an X-Org server and run that on Windows, and set `DISPLAY` in ~/.bashrc in WSL, and you're good to go. It's a full Linux, isn't it? So that stuff just works as well. I don't really do this, because I haven't needed it. But it's nice to have the option, in case you need to run some GUI stuff that's easier to launch from Linux than from Windows.

## Enter... WSL2

But hey. Apparently, none of this was good enough. 

Because coming up is a remake of WSL, based on a real (thankfully upstream) Linux kernel, instead of the re-implementation against NT that is WSL 1.

Microsoft has [a blog post about this](https://devblogs.microsoft.com/commandline/announcing-wsl-2/). They use some fancy new virtualization technology to make sure there's no startup times, the environment is not isolated (so binding ports etc is just like WSL 1), and it has no resource usage overhead compared to WSL 1 (which has no overhead).

Apparently, one of the upsides of this is that with a real kernel running, things like Docker will start working under WSL. So you won't need to virtualize (manually) to use Docker, and tell it how many cores it should allocate and how much memory it should have available. Because apparently that's the sort of problem that WSL2 is not supposed to have.

I'm looking forward to it! I'm super happy with WSL the way it is now, but if it's gonna get even better, then that's good too.

They're also gonna try to fix the biggest gripe with WSL1 which is file system performance. NTFS just isn't as fast as ext4, and WSL is on top of NTFS. WSL2 uses some fancy something something which is gonna make everything much better, apparently.

You can probably tell I don't know a whole lot about WSL2. That's because it isn't released yet, and I haven't actually used it.

But the way I see it, all the changes Microsoft has made the last.. What.. 5 years? 10 years? Has all been steps in the right direction. So I expect WSL2 to continue that trend.