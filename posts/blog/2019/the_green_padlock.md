date: 2019.12.17
title: The green padlock
series: advent_calendar_2019

We just love that green padlock, don't we. The green padlock means that nobody can read your communications online.

Yeah, right.

## Whose CA is it anyway?

You probably know about CAs already. Certificate Authorities. There has to be some trust somewhere in HTTPS, and that's where it's at.

So which CAs do you have on your system?

Who do you decide to trust?

In my case, I trust two parties: Mozilla and Microsoft. Firefox (Mozilla) has their own list of CAs and don't piggyback on the OS at all. But I also have to trust the CA list in Mocrosoft when I download dependencies on Maven or use Chrome because the tracking protection in Firefox is making a website I use not work properly (sites that use Facebook for commenting, for example).

So it's not really your decision, is it?

But surely, we can trust Mozilla and Microsoft (and Apple and Canonical and ...)?

## Yeah, but no

[Here's the list from Mozilla](https://ccadb-public.secure.force.com/mozilla/IncludedCACertificateReport). I use Mozilla as an example, because they're the ultimate good guy on the internet.

I mean, "CFCA EV ROOT" is something we can trust, right? China Financial Certification Authority?

And "E-Tugra Certification Authority" from Turkey?

And probably 50% of the CAs that are from USA?

There's absolutely no way that the governments in those countries can issue fake certificates for surveillance purposes?

We trust them completely?

Sure, you can do that. And most of us do!

But is your data actually safe?

## The dog that doesn't bark

Have you noticed how there's a battle against encryption going on? Many goverments really don't like WhatsApp and Telegram all that much. They use end-to-end encryption, which means that there's no 3rd party to trust (loosely speaking). The govermnemt can't just issue a MITM certificate that looks real, you actually have to get access to the end user device (loosely speaking) to read the data.

So the governments don't like that, because they're locked out of WhatsApp.

What about encryption on iOS and modern Android devices? The government sure would like a back door into that system, and complain loudly about their inability to access locked mobile phones.

How often have you heard the governments complain about https?

Never?

I've never heard them complain about that.

That's the dog that doesn't bark.

Of course the government can read our HTTPS traffic if they want to.

## Conspiracy?

Yeah I guess. I don't know this to be true.

And I totally get that being locked out of communications sucks, when your job is to monitor communications. [We've spent lots of resources in the past](https://en.wikipedia.org/wiki/Enigma_machine) attempting to read encrypted/scrambled comms, so there's no reason to assume that will stop now.

I'm honestly not sure if I think it's that bad if the government can read HTTPS, which I'm sure they can, or they would have complained about it.

But can we trust the CA system?

Nah.

