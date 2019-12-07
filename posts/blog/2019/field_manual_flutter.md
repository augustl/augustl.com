date: 2019.12.07
title: Field manual: choosing Flutter
series: advent_calendar_2019

Here's my opinionated summarized thoughts of things to take into consideration when deciding whether or not to choose Flutter.

## What is Flutter?

[Flutter](https://flutter.dev) is a cross platform native mobile app framework.

Flutter is developed and maintained by Google.

It's heavily tied into the [Dart (programming language)](https://dart.dev) ecosystem. So you're gonna be writing all of your code in Dart. The Dart code is compiled into native iOS or native Android code.

Flutter does not use web technology for anything.

Flutter also does not use existing native GUI frameworks for anything - Flutter _completely re-implements the GUI stack, using their own rendering engine_.

You can almost think of flutter like a 3D gaming engine, except that it's for 2D GUIs. Your app will show a Flutter view, and the Flutter view will do everything itself. Flutter renders _absolutely everything_.

So when you see a table view and scroll it, you're not seeing _anything_ from the Android or iOS native code, you're seeing Flutter.

You can choose between a material (Android-like) look, a "coupertino" look (iOS-like), or take complete control of the look and feel yourself. If you choose "cupertino", you app will look exactly like an iOS app on iOS _and_ Android. Vice versa for material. This means that Google has put a great effort into making the respective themes look and feel completely like their normal native counterparts. And from what I can tell, they've succeeded. There are no obvious tells that something is "a Flutter app".

Flutter is a well put together system. Some systems gives me the impression that it's only partly open sourced, and that the vendor has internal utils that are vital but not released. That is _not_ the case with Flutter. Flutter has solutions and APIs for all the problems you typically encounter.

## Why is Flutter a good idea?

Flutter is a good fit for small teams that needs to make apps that works on both iOS and Android.

It's an even better fit if you don't want your app to look and feel like a native app.

That's actually quite common these days in my experience. A lot of the apps on my home screen don't look even a little bit native (Notion, Spotify, Snapchat, Vipps, IKEA Home Smart, Duolingo, Economist  Espresso). For that kind of app, there's no need to choose a framework that makes your app look native.

You do have that option, of course. There are constructs in Flutter to have your app dynamically switch between themes, and use the material theme on Android and the Cupertino theme on iOS.

## Mixing Flutter and "normal" native

_Note: in the apps I've made with Flutter, I'm yet to use this functionality myself, so this is not first hand knowledge or experience._

When you create a new Flutter app, it generates an iOS app and an Android app for you. These are just normal iOS apps, that are set up so that the first thing that renders after the app launches, is the single Flutter view, that runs your Dart code to render the GUI.

This means that for rendering "normal" native views, you have two options.

One is to simply navigate away from the Flutter view, and open a normal native view. Since Flutter runs under a normal native app that you can essentially do what you want with, just modify the generated apps to support navigation into another view controller or fragment or activity. The Flutter project has [provided examples and best practices](https://github.com/flutter/flutter/tree/master/examples/platform_view) for how to do that.

The other is to use a new mechanism in Flutter to embed views from native inside your Flutter app. This is called "platform views" and relies on [AndroidView](https://api.flutter.dev/flutter/widgets/AndroidView-class.html) or [UIKitView](https://api.flutter.dev/flutter/widgets/UiKitView-class.html). This is early access stuff and work in progress, but you have the option.

There are also packages available for embedding some of the more common views, relying on the "platform view" mechanisms. One such exapmle is the [Google Maps package](https://pub.dev/packages/google_maps_flutter).

## Does a completely new rendering engine make sense?

It does.

First and foremost, you get the exact same rendering engine on both iOS and Android. So you can make fast, smooth - and intricate - native animations, and have them work just as you expect on both platforms. You almost don't have to do any cross platform testing of that sort of thing. Flutter does not piggyback on any native GUI rendering capabilities, so a difference between platforms is a bug in Flutter, not a bug in your code. And Flutter is widely used and well tested at this point.

Secondly, you get a _different_ rendering engine than other rendering engines. It's made to be declarative to the core. So Flutter can completely skip the reconsiliation step between the declared GUI and the actual rendered platform GUI, which is what React has to do. And personally, I like that it exposes a whole lot of useful constructs to you, that you can play around with. There are defined APIs for almost everything, and very little is hidden from you. In my experience, Flutter is the most powerful and flexible rendering engine I've ever worked with.

## Flutter Web

Flutter for native mobile apps doesn't use web technology for anything.

But you can [use Flutter to make web apps](https://flutter.dev/web).

More specifically: the Flutter rendering engine has been ported, and implemented using web technology.

If you prefer to work with the Flutter rendering API instead of the CSS/DOM APIs directly, this can be a nice productivity boost. Interaction and animation heavy GUIs can be easier to implement using Flutter, especially if you have some prior knowledge of Flutter and the various APIs it exposes.

One of the last remaining problems of web GUIs, despite all the progress that is being made these days, is that it's difficult to display huge lists/tables of information and maintain 60 fps scrolling speed, fast initial render, and low memory usage.

With Flutter web, this is a problem of the past.

This means, obviously, that it _is_ possible to make performant table views using CSS/DOM. Because Flutter web renders to the DOM, it doesn't render to a canvas or WebGL or anything like that. Flutter makes those rather abstract APIs much more accessible, though, through a familiar lazy list view API.

I might end up blogging more about the details of this at a later time. It's a very interesting subject.

## Adopt?

I'm not a tech radar. Make up your own mind. :) 