date: 2016.11.25
title: Notes on my attempt to move from Linux/Mac to Windows

Surface Studio [was announced](https://www.youtube.com/watch?v=BzMLA8YIgG0), and [Hololens](https://www.microsoft.com/microsoft-hololens/en-us) is amazing. Microsoft has seduced me into switching to Windows as my development/programming envrionment. I could easily se myself using a Surface Pro 4 or the  upcoming Surface Book 2 as my main dev box.

Here are my notes and thoughts on my 3 week trip into Windows land.

_Tl;dr: Windows 10 is great, the integrated marketing sucks, git is slow, did it alone without help of experienced Windows devs and failed - I'm back to Linux now. Open to trying again._

## Generally, most stuff works

I did everything I could to avoid a Unix hybrid with cygwin or the new Ubuntu on Windows thingie. I wanted a sexy and sleek setup. And we all know that sexy hybrids doesn't exist.

I used PuTTY for SSH, cmd.exe and Powershell instead of Bash. I installed Python 2.7 and the C/C++ compilers from Visual Studio. I had no problems getting a Node.JS app set up that compiled Sqlite3 for me and everything just worked. IntelliJ works just fine, as does Emacs.

I quite liked that you used a GUI to configure environment variables. After a cople of weeks of Windows, the Linux way of editing config files felt weird and hacky.

## Unix supremacy and Git

> LMAO WINDOWS suxxxx, Git doesn't even work properly!!! 
> 
> -- Mac/Linux devs

I use Git for version control, and git is slow on Windows. Magit (the Git GUI in Emacs) is even slower.

Unix has super fast process forks and Git/Magit relies heavily on this. Forking a process in Unix is close to a no-op. The work happens lazily with Copy On Write for the process memory. Windows is wired differently, and creating a process has much more overhead there.

I've come to refer to this as Unix supremacy. In my world, everyone uses Linux or Mac for programming. Many Linux/Mac users will blame Windows. The real problem is Git, for not being portable to non-Unix environments. Git is not slow because Windows is slow or is badly designed. Windows is different, the assumption that a new process is cheap does not hold.

This is a difficult problem to solve. I tried Mercurial with hg-git, which is like git-svn. I worked with a mercurial repo locally, and pushed/pulled onto a remote Git repo. It actually worked great, and solved all my performance issues. But for some reason I could not get push to git over HTTPS to work. hg-git would fail with a 403. I could not put the username/password in the repo URL, nor configure mercurial to read them from a config file.

## Bugs?

I would get weird behaviour when creating new folders in my "home" folder (C:\Users\August Lilleaas). I right clicked to add a folder, hit enter, and explorer.exe locked up. If I created the folder without renaming it, I got a "New Folder", but it would fail when renaming it afterwards.

I some times would get error messages with error codes (and few/no hits on Google) when doing stuff in explorer.exe. Tried to delete a folder, got "Unknown Error: 0x000something something".

## File system locking

Windows locks the file system. If a process has opened a file, you cannot move it or delete it while it is open. This is a sensible feature, and I have no problems with an operating system that tries to hold my hand here.

I wish I had more insight here, though. A few times when deleting in powershell or in explorer.exe, I would get an error saying the file was open in another process. Windows did nothing to show me _which_ process that had the file open, though. Windows has the information, obviously. I found a tool that would list them upon entering an obscure query string. Why the error dialog that pops up doesn't show a list of processes with nice icons, is beyond me. It makes the locking feature  half assed.

## Shady shit

Microsoft does a lot of shady shit that makes me want to stay away from the platform.

Look at this shitty notification you get when you use Chrome.

<p><img src="/static/posts/windowsnotes/chrome-windows-shady-shit.jpg">

And then there's [this blog post](https://eugene.kaspersky.com/2016/11/10/thats-it-ive-had-enough/) from the Kaspersky AV folks. That post is actually the last drop that made me stop this entire experiense. It's insane how many dark patterns and marketing crap Microsoft shoves into Windows 10.

## I wish I had the help of experienced Windows devs

For all I know, experienced Windows devs reading this post will say "oh but you just need to install Windows Fix Tool XYZ". Perhaps there's a way to unfuck a few of these things. I would like to disable the marketing nonsense. Maybe I could tweak explorer.exe to handle file locking better. Find a way to make git fast that I don't know of, etc. 

I haven't ruled out Windows completely and I'm open to giving it another go. Especially if Microsoft continues to out-invent Apple on every turn.
