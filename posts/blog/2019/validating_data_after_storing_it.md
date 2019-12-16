date: 2019.12.16
title: Validating data after storing it
series: advent_calendar_2019

This is me trying to be some kind of thought leader or something. Someone told me they do this in their system, and it stayed with me. So I want to share what they told me.

Keeping it short and sweet.

## Mission critical

Typically, we validate our data on the way in. Validating the shape of our data is a big part of modelling a domain, so this is commonplace and normal, and it makes complete sense.

But what if data is mission critical? Even if it's not 100% valid yet?

Let's say it's a medical system, for ordering important and vital equipment. Maybe social security number is a required part of the form.

Should you be blocked from ordering vital equipment just because you don't have access to or don't have the time to find the social security number of the person in question?

In that case, it's better to allow "invalid" input. So you want to have a place to store the social security number, but you should allow blank values there.

Maybe you have a separate part of the system that lists all the "invalid" items that you are required to fix at some time. And if you don't, maybe the owners of the system will fine you or punish you in some way. The social security number is _definitely_ required, after all - just not right away.

## Mundane

This happened to me once:

A electrician was going to replace something in my breaker box. He had a PDA thing with him, where he took some pictures and filled out a form. He did this while he was in my house.

Then the app on his PDA crashed, and all the data was lost.

So he had to do it all over again, while still being in my house. And being visibly annoyed. While billing me, probably.

Bugs can happen, of course. There's no known process for making crash-free systems.

But what if the default for this system was: "always store all data, validate it after it's stored?"

Then, at least the pictures he took and the form he filled out could be constantly saved while he worked. Without adding any extra layer of "draft" storage etc. It could just run the normal operation of saving the form.

Then, in his car later, he could see that all is saved in the database, but he needs to fill in a few more fields to make the form completely "valid".

So maybe this is a good idea?

To separate the idea of "storing" and "validating" data?

Probably not in all cases. But I bet that a whole lot of systems could be made that way without much hassle. And it seems to me that we default to validating data before storing it without really thinking about it on a case-by-case basis.