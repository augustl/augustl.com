date: 2019.12.05
title: Linux exists only because of a happy accident
series: advent_calendar_2019

You should read the book [Just For Fun](https://www.amazon.com/Just-Fun-Story-Accidental-Revolutionary/dp/0066620732), Linus Torvalds' autobiography.

If you understand Norwegian, or just want to pretend you do, you should also [listen to the episode we made](https://utviklingslandet.no/ep/2019-06-26/) about the same subject as this blog post.

It's story time.

## How Linus Torvalds accidentally created Linux

It's 1990, and Linus Torvalds was an unhappy Minix user.

After owning a few interesting computers (a VIC-20 and a Sinclair QL), Linus saved up some money and bought a very grey and uninteresting IBM compatible PC. With it was bundled a version of DOS, which he immediately replaced with Minix.

By "immediately", I mean "spent the better part of a week installing it".

Minix was reasonably popular at the time, and also free, which was a killer combo for a poor university student in Helsinki, Finland. Linus ordered Minix in advance. A month later, it arrived - in the form of 16 floppy disks.

Designed by Andrew Tanenbaum, Minix was meant as a teaching aide at mr. Tanenbaum's professorate at an Amsterdam university. It was gimped by design, and not really a full blown OS. There were patches floating around to improve its usefulness, and one of the more popular and useful were made by Bruce Evans, an Australian.

16 floppy disks, manual patching - no wonder it took Linus almost a week to set it up.

Linus was reasonably happy with Minix, but it lacked some of the things he needed. Linus being Linus, he wrote his own.

His main project was a terminal emulator, for calling up the university computers to go online, or just use the more powerful computers available to students. He wanted to learn the inns and outs of his IBM PC, so he wrote the terminal emulator on the hardware level. 

No OS.

This terminal emulator was the beginning of Linux.

He wrote a disk driver, so he could save his work while he was outside Minix land. Eventually, his terminal emulator was able to launch BASH. (Yes, BASH is that old.) Linus called it his "gnu-emacs of terminal emulation programs".

It's fall, 1991.

Linus now considers shelving his terminal emulator. He's reasonably happy with it, and it does what he needs it to do.

In other words: Linus became bored with a project he was working on. Boy, do I recognize that feeling.

Then, Linus **accidentally deleted his Minix partition**

In Linus' own words:

> Back then, I was booting into Linux but used Minix as the main development environment. Most of what I was doing under Linux was reading email and news from the university’s computer via the terminal emulator I had written. The university computer was constantly busy, so I had written a program that auto-dialed into it. But in December, I mistakenly auto-dialed my hard disk instead of my modem. I was trying to auto-dial /dev/tty1 [...]. But by mistake I auto-dialed /dev/hda1, which is the hard disk device. The end result was that I inadvertently overwrote some of the most critical parts of the partition where I had Minix. Yes, that meant I couldn’t boot Minix anymore.
> 
> That was the point where I had a decision to make: I could reinstall Minix, or I could bite the bullet and acknowledge that Linux was good enough that I didn’t need Minix. I would write the programs to compile Linux, under itself, and whenever I felt I needed Minix, I would just add the desired feature to Linux.

So there you have it.

Who knows, if Linus didn't accidentally ruin his Minix partition, Linux might never have seen the light of day.

Here's to happy accidents!