date: 2019.12.15
title: According to Microsoft, the number one predictor of software bugs is...
series: advent_calendar_2019

UPDATE: This article was too clickbait-y. I've [made a proper version of it here](https://augustl.com/blog/2019/best_bug_predictor_is_organizational_complexity/).

Microsoft launched Windows Vista in 2007, with varying degrees of success.

Microsoft Research made a substantial effort to figure out what went wrong.

They learned something surprising (or maybe not?) about the number one predictor of software bugs.

## Microsoft Research, and Vista

Windows Vista was a problematic release, to say the least. Vista is often placed alongside ME (Millennium Edition) as the two versions of Windows that were, put simply, bad releases.

I'm not going to go into great detail here. But they struggled, and Microsoft knew it. For example, they had this amazing commercial running in 2008: The Mojave Experiment, where Microsoft basically pranks people into saying positive things about Vista.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ihorvo2tEuA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Microsoft Research was tasked with discovering and developing methods Microsoft could use in future projects to avoid repeating the same kind of mistakes.

## What did they find out?

Microsoft Research [developed a new statistical model](https://www.microsoft.com/en-us/research/publication/the-influence-of-organizational-structure-on-software-quality-an-empirical-case-study/) for predicting whether or not a module risked having bugs. To evaluate the quality of the new model that they made, they compared it to other well known models used in other studies before them.

* **Code Churn**. Measures the number of changes in version control of a module.
* **Code Complexity**. Measures the number of code paths, the number of functions that call each other internally in the module, depth of inheritance hierarchies, coupling between objects, number of sub classes, etc.
* **Dependencies**. Measures the number of external modules calling you, how many external modules you're calling, how many layers a module is away from the hardware, etc.
* **Code Coverage**. Traditional test coverage that most developers are probably already familiar with.
* **Pre-Release Bugs**. Number of issues in the issue tracker.

In addition to these pre-existing models, the new model they made was:

* **Organizational Complexity**. Measures number of developers workong on the module, number of ex-developers that _used_ to work on the module but no longer does, how big a fraction of the organization as a whole that works or has worked on the module, the distance in the organization between the developer and the decision maker, etc.

Microsoft published a study, where they used statistical methods to measure these different methods up against one another.

If you want details, and happen to understand Norwegian, you can listen to [this podcast episode](https://utviklingslandet.no/ep/2019-05-08/) that I made. The short summary is that the two columns in the table below shows the following:

* **Precision** - how many modules that had bugs, did we detect?
* **Recall** - of the modules you thought had bugs, how many did actually have bugs?

The results below are Microsoft running their models against the various modules in Vista, and compared that with how many bugs the module actually had 6 months after Vista was released. They found the following:


| Model                    | Precision | Recall |
| -------------------------|-----------|--------|
| Organizational Structure | 86.2%     | 84.0%  |
| Code Churn               | 78.6%     | 79.9%  |
| Code Complexity          | 79.3%     | 66.0%  |
| Dependencies             | 74.4%     | 69.9%  |
| Code Coverage            | 83.8%     | 54.4%  |
| Pre-Release Bugs         | 73.8%     | 62.9%  |

Yowza!

The organizational structure has the highest precision by far - so it found the most amount of bugs. _And_ it has the highest recall - so of the modules that it thought could have bugs, almost all actually had bugs.

That's pretty interesting, isn't it? The distance to decision makers and the number of developers working on a project is clearly and unambiguously the issue that is the best predictor of future problems with a code base.

Another shocking discovery for me personally, is that the only one that I've actually used myself - code coverage - has the lowest recall. In other words, almost all the issues it predicted turned out to not be real issues.

## And the study is replicated!

Science is going through somewhat of a [replication crisis](https://en.wikipedia.org/wiki/Replication_crisis), where fundamental and highly cited studies has turned out to not be reproducible. 

Thankfully, the predictive value of organizational complexity to software has been replicated!

[In the replicated study](http://www.scs.ryerson.ca/~avm/dat/manuscripts/ICSE_2015.pdf) the predictive value of organizational structure is not as high. Out of 4 measured models, it gets the 2nd highest precision and the 3rd highest recall. The study itself concludes that organizational complexity as a bug prediction method is worth investigating further. The study is also based on individual functions in C/C++, and not entire modules like Microsoft Research did, which can be a reason for at least a part of the discrepancy.

Also, the model for measuring organizational complexity doesn't measure the organization itself, compared to other organizations. I wouldn't be surprised if Microsoft is one of the most complex software organizations in the world. So maybe that's why organizational complexity was at the top of the list at Microsoft.

Another thing to consider is the difference between formal and informal organization structure, which none of the studies takes into account. The Microsoft study just automated its model against data from the HR system. Watch Ed Catmull of Pixar talk about this here (10:06)

<iframe width="560" height="315" src="https://www.youtube.com/embed/k2h2lvhzMDc?start=606" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>