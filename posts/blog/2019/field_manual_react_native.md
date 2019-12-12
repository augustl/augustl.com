date: 2019.12.12
title: Field manual - choosing React Native
series: advent_calendar_2019

Here's my opinionated summarized thoughts of things to know about and take into consideration, when deciding whether or not to choose React Native for your next mobile app.

## What is React Native?

[React Native](https://facebook.github.io/react-native/) is a cross platform native mobile app framework.

React Native is developed and maintained by Facebook.

React itself is primarily thought of as web technology. But React Native is _not_ a web view wrapped in a native app.

React Native will render pure native GUIs, using the built-in native GUI widgets on iOS and Android.

A separate thread in your app will execute and evaluate JavaScript. This thread is where all your React code lives, which is written in JavaScript (or any language that compiles to JavaScript, like TypeScript, PureScript, etc).


With React, you return `div` and `p` elements when you render. In React Native, you either return specific named instances of native elements, like `ImagePickerIOS` and `ToastAndroid`. Or you return abstract React Native elements like `View`, `Text` and `Touchable`, for the elements where it makes sense to have the exact same render logic on iOS and Android.
 
 Just like on the web, React Native maintains the previous and current versions of a virtual "DOM" (except it's not a "DOM", but native views), diffs them, and figures out what updates that needs to be made on the native side. Then, the web thread sends messages to the native component of React Native that runs inside UIKit or the Android GUI stack, and the native GUI is updated according to the changes that the JS thread determined needed to happen.

Architecturally speaking, the simplest way (in my opinion) to set things up is to create a plain iOS native app and a plain Android native app, include React Native in both of them, point it to your JS build server in dev or the compiled JS in release, and tell your native app to render its view using React Native. This sets up the bridge mentioned above, where a JS thread talks to the native side of things that you set up, and updates _real native views_ as your app runs. 

It seems to me that Facebook probably has some in-house tooling that it hasn't released yet. For example, navigation is not solved _at all_. Navigation requires its own section.

## It's nice that it's "just a native app"

Need to e.g. send push notifications? Just do it. 

I personally like this aspect of React Native a lot. I don't have to look up "how to send push notifications with React Native". My setup is that I have two completely normal native apps that I created myself, and they both pull in React Native and use that to render views.

So when I added support for push notifications, I just updated my plain native apps as you would do if you were actually making a plain native app. It's easy to send messages back and forth between your JS thread and the native world, so it's completely up to you how much you want to handle in native and how much you want to handle using JS.

Same with image pickers. I ended up writing 50-ish lines of native code in iOS and Android to listen to an event, open the native image picker, and emit an event back with "here's the image". No need to pull in a dependency to do this, no need to rewrite anything, etc.

## Navigation in React Native

Getting navigation right is in my opinion the biggest caveat with React Native.

In a big part because you're completely on your own. React Native itself has nothing here to help you.

Writing it yourself is not recommended. The bridge between your JS code, which would define/declare the navigation structure, and your native code, is asynchronous. So it then falls on you to create a reliable asynchronous state replication system that calls asynchronous APIs on the JS side and asynchronous APIs on the native side, and hope there are no race conditions. I've been there, done that. Never again.

There are a few options that are dependencies you can drag in. [react-navigation](https://reactnavigation.org) is a non-native implementation of navigation. In other words, if you use react-navigation on iOS to push and pop UIViewControllers, it won't actually use a _real_ `UINavigationController`, but a re-implementation that sort of kind of _looks_ like `UINavigationController`. Then there's [react-native-navigation](https://wix.github.io/react-native-navigation/#/), which implements the async native bridge I talked about in the previous paragraph. It turns out that this is not easy to do, and we had problems with the occasional strange race condition and crash. It also changes a lot, in a non-backwards compatible way, which rubs me the wrong way. Your experience may differ from mine, of course.

The last option, which is what I probably would have done if I were to start a new React Native app today, is to re-implement navigation twice, once for each platform. Android has some great new constructs for navigation using fragments and jetpack. iOS has storyboards, which among other things solves the problem of double navigation - if you double tap a button that calls "push" to go to a new screen, you risk navigating twice. Storyboards solves that.

For the types of apps I write, the navigation typically isn't _that_ massive, it's the rendering of the views and the interaction and the data synchronization and stuff like that that's the biggest part of the codebase by far. So having a bunch of storyboard pages in iOS where all they do is to render their view using React Native, seems like a good choice to me.

## Performance

There's no way to get around the fact that JavaScript has to be loaded and parsed as part of the startup procedures.

On iOS, you at least have the benefit of super fast JavaScript execution. But your app startup time _will_ be slower. You can always split up your app in many parts, so that your login screen is a separate JS file, and when that's loaded you start loading the JS for the next screen in the background, etc. But in my experience, React Native is chosen because the team is small and fast delivery lead times is important, so this is not the sort of thing you typically spend much time fixing. Your mileage may vary.

On Android, however, things are looking up. Since Android is a more flexible runtime, technically speaking, than iOS, Facebook has created its own JS engine, specifically for React Native, called [Hermes](https://github.com/facebook/hermes). Essentially, all of the JS is compiled ahead of time, so it's just a matter of loading the compiled JS into memory and start executing it, giving load times similar to or as good as that of a pure native app.

Other than that, performance is good. Modern devices are good at executing JavaScript. Memory usage is higher of course, due to having all the JavaScript loaded (unless you set up some fancy partial loading, as mentioned), so you might have some issues with memory management on older devices.

## Sophisticated animations: write them as pure native

In my experience, if you need sophisticated animations, you will end up hitting walls when implementing those in React Native. Write them as pure native instead.

First, writing something as pure native is easy. You can render a `MyFancyView` in your React code, and write that view yourself, in normal native, so you have full control of the specific GUI APIs you want to use to render your view just like you want to.

Secondly, the async bridge between your JavaScript and your native code is the biggest actual limitation here. Some animation APIs on the native side of things require immediate synchronous answers, and the native code simply can't do that, it has to wait for an asynchronous event loop on the JavaScript thread to get answers.

## Graphics: use bitmaps

My instinct was to use vector graphics, because it's 2019. Don't do that, use bitmaps.

There are packages for rendering SVGs etc in React Native, but those are full re-implementations of SVGs and your mileage may vary, to say the least.

Android has some vector support, but iOS really prefers bitmaps (in different resolutions) so your life will be much easier if you just use bitmaps.

## Adopt?

Personally, I would have tried Flutter the next time I were to create a native mobile app. But that's mostly because I have now actually tried React Native on a large app, and only used Flutter for smaller apps in my spare time. Maybe the grass is just greener on the other side :) 

But, you should make up your own mind.