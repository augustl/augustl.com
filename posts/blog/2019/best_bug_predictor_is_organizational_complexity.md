date: 2019.12.18
title: The #1 bug predictor is not technical, it's organizational complexity
series: advent_calendar_2019

In this post, I'll explore the findings made by Microsoft Research, after the unsuccessful launch of Windows Vista in 2007. Microsoft decided to dig deep and figure out what went wrong.

The marketing department busied themselves with pranking people into saying that they like Vista.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ihorvo2tEuA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

The research department, on the other hand, decided to do some research.

This is what they found.

## Organizational complexity is the best predictor of bugs in a software module

This first section will summarize the findings. Later on, I'll describe what the findings mean, and more details about the methods used.

Microsoft Research [published a paper in which they developed a new statistical model](https://www.microsoft.com/en-us/research/publication/the-influence-of-organizational-structure-on-software-quality-an-empirical-case-study/) for predicting whether or not a software module was at risk of having bugs, based on a statistical analysis of the module itself.

The new model they developed was compared to these pre-existing well known models for predicting software bugs:

* **Code Churn**. Measures the number of changes in version control of a module.
* **Code Complexity**. Measures the number of code paths, the number of functions that call each other internally in the module, depth of inheritance hierarchies, coupling between objects, number of sub classes, etc.
* **Dependencies**. Measures the number of external modules calling you, how many external modules you're calling, how many layers a module is away from the hardware, etc.
* **Code Coverage**. Traditional test coverage that most developers are probably already familiar with.
* **Pre-Release Bugs**. Number of issues in the issue tracker.

In addition to these pre-existing models, the new model they
developed  was:

* **Organizational Complexity**. Measures number of developers workong on the module, number of ex-developers that _used_ to work on the module but no longer does, how big a fraction of the organization as a whole that works or has worked on the module, the distance in the organization between the developer and the decision maker, etc.

The results really do speak for themselvers.

| Model                    | Precision | Recall |
| -------------------------|-----------|--------|
| Organizational Structure | 86.2%     | 84.0%  |
| Code Churn               | 78.6%     | 79.9%  |
| Code Complexity          | 79.3%     | 66.0%  |
| Dependencies             | 74.4%     | 69.9%  |
| Code Coverage            | 83.8%     | 54.4%  |
| Pre-Release Bugs         | 73.8%     | 62.9%  |

(Higher numbers are better. A more detailed description follows.)

That's pretty interesting!

Organizational structure has the highest precision, _and_ the highest recall. (Again, more on the details later).

That's pretty interesting, isn't it? The distance to decision makers and the number of developers working on a project is clearly and unambiguously the issue that is the best predictor of future problems with a code base.

Another shocking discovery for me personally, is that the only one that I've actually used myself - code coverage - has the lowest recall. In other words, almost all the issues it predicted turned out to not be real issues. (_Again_ again, more details later).

## Predicting bugs?

What do these numbers actually mean? And what does it mean to predict bugs in a software module?

Again, [the original paper](https://www.microsoft.com/en-us/research/publication/the-influence-of-organizational-structure-on-software-quality-an-empirical-case-study/) has the full description. What follows is my layman summary in blog form.

The "precision" and "recall" values are the results of a method for evaluating the actual predictive powers of the analytical models. 

The gist of it is that you compare two things: The predictions made by the prediction method, without any knowledge of real-world bugs. And actual real-world bug information, gathered some time after release.

The very general summary of the statistical process is as follows:

* You analyze a software module using the prediction model, and return a p value (a number between 0 and 1, where 0 means zero chance of bug, and 1 means it's completely confident that there's bugs).
* You use that p value to define a binary "yes" or "no" for whether or not you think a module has a bug. If p < 0.5, the module is flagged as buggy.
* A module, in the context of Windows Vista, is an individual DLL. So a device driver, a kernel module, etc.
* You take the 3000 (ish) modules in Vista and, divide them into 3 random parts. One part gets the prediction method run on them, and that result is compared with the remaining two parts based on whether or not it actually had a bug in the real world
* You extract precision and recall values out of that (more on that later)
* Repeat 100 or so times, and check that you get an roughly even distribution of precision and recall values across all the random selections.

And voila! You have your numbers.

So what exactly is precision and recall?

## Precision and recall

When you run your comparison of "here's the result my prediction method got" and compare it to "here's how many bugs the module _actually_ had", you get precision and recall values.

Remember that we checked 1/3rd of the modules with the prediction method, and compared it to the actual real world results of the remaining 2/3rds. This comparison yields the numbers in the table above.

So what does it mean?

* **Precision** - how many modules that had bugs, did the prediction model detect?
* **Recall** - of the modules that the prediction model thought had bugs, how many did actually have bugs?

Having a low precision is not the end of the world. It just means that you could have detected more buggy modules, and that some buggy modules went under the radar.

Having a low recall is worse. That means that the prediction model said tagged a module as buggy - but it turned out that the module actually wasn't.

## Doesn't that mean that I need actual bug data to predict bugs?

No.

The Microsoft Research team compared their prediction models to real world bug information 6 months prior to release.

But they only used this to get some numbers of how valid the methods are.

The actual prediction method in and of itself only requires access to the source code, and in the case of the organizational complexity analysis, data about committers in the HR system so they can run the organizational metrics as well.

But no real world bug data is required to run these models.

So now that the model has been verified, you can run it on an unreleased module and get predictions on whether or not that module will have bugs in it.

## The study has been successfully replicated

Science is going through somewhat of a [replication crisis](https://en.wikipedia.org/wiki/Replication_crisis), where fundamental and highly cited studies has turned out to not be reproducible.

Thankfully, the predictive value of organizational complexity to software has been replicated!

[In the replicated study](http://www.scs.ryerson.ca/~avm/dat/manuscripts/ICSE_2015.pdf) the predictive value of organizational structure is not as high. Out of 4 measured models, it gets the 2nd highest precision and the 3rd highest recall. The study itself does conclude that organizational complexity as a bug prediction method is worth investigating further. The study is also based on individual functions in C/C++, and not entire modules like Microsoft Research did, which can be a reason for at least a part of the discrepancy.

Also, the model for measuring organizational complexity doesn't measure the organization compared to other organizations. I wouldn't be surprised if Microsoft is one of the most complex software organizations in the world. So maybe that's why organizational complexity was at the top of the list at Microsoft.

Another thing to consider is the difference between formal and informal organization structure, which none of the studies takes into account. The Microsoft study just automated its model against data from the HR system. Watch Ed Catmull of Pixar talk about this here (10:06)

<iframe width="560" height="315" src="https://www.youtube.com/embed/k2h2lvhzMDc?start=606" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

At any rate, this discovery coupled with the findings from [Accellerate](https://www.amazon.com/Accelerate-Software-Performing-Technology-Organizations-ebook/dp/B07B9F83WM/ref=sr_1_1?keywords=accellerate&qid=1576617532&s=books&sr=1-1) leads me to at the very least believe that social elements is probably under-measured in software projects, and should be taken more seriously.