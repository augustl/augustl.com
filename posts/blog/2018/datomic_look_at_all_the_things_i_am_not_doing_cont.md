date: 2018.04.21
title: Datomic: Look at all the things I'm not doing! (Cont.)
series: datomic

In [a previous blog post](http://augustl.com/blog/2018/datomic_look_at_all_the_things_i_am_not_doing/) I listed a bunch of things I'm _not_ doing when I'm using Datomic.

This is a continuation of that post, where I list even more things that I'm not doing, based on feedback I got on the previous post.


## Look at all the query sit-ups I'm not doing

Thanks, [@newresa](https://twitter.com/newresa/status/987660036682993664)!

In a traditional database, the query engine runs on the database server.

Well, duh. Of course. That's how databases work.

Or do they?

With Datomic, the query engine is embedded into the client.

This is _not_ to say that Datomic does something like `SELECT * FROM *` and iterates a bunch of maps and has a bunch of stupid if-statements and regexps to query your data. It's a proper, real query engine, based on the Datalog language, that converts a query into efficient index access and so on and so forth.

_This concept is an unbelievably good idea that I will try to blog about in detail later._

There are a few rules that you thought were rules that aren't rules anymore with this architecture.

Fundamentally, the data structures in Datomic allows multiple queries to run simultaneously, without synchronization on the database server, or between the clients that are running queries. This means that queries are trivial to scale horizontally - you just add another instance of your app, and it'll run more queries in isolation, with no effect on the performance of other queries. The only bottleneck here is fetching data from storage and into the client. You can put memcached between storage and your apps to help alleviate this.

In traditional databases, we've learned to avoid N+1 queries. To list projects and count the todo items for each project, we do NOT run one query to list the projects, and then one more query for each project to count the todos.

Why? This is not because queries are slow. Fundamentally the same amount of work has to be done by the query engine. But there will be a round-trip cost from sending the query to the database and getting the response back. This is just fundamental networking.

This is not the case with Datomic. The query engine is _right there_, in your application.

If you think this sounds crazy, it helps to remember that _someone_ has to have the working set in memory. Your database server can't seek on disk when you run a query, that would just be way too slow. So why does this _have_ to happen on the database server? Well, it hasn't. Not when you use Datomic.

**So you end up designing much simpler queries with Datomic, since you don't have to express your queries as one huge statement**. You _can_ actually get the list of projects, and then count the number of todos for each project directly in the loop.

This might sound crazy. But it isn't.

## Look at all the application level caching I'm not doing

On a related note, you don't need to cache the result of database queries at the application level when you use Datomic.

Kind of.

Application level caching is a common pattern to use, where you cache the result of queries. If you cache because the query is slow, Datomic can't help you. Slow queries are slow, even if the query engine is embedded in your application. However, if you're caching in order to avoid round-trips on read-heavy and cacheable queries, Datomic can help.


It should be self evident why Datomic is different here. The query engine and your working set is already in your application. So there's no need to cache what's already cached.

Thanks, [val_waeselynck](https://twitter.com/val_waeselynck/status/987402104804466690)!

## Look at all the audit logging I'm not doing

Thanks again, [val_waeselynck](https://twitter.com/val_waeselynck/status/987402104804466690)!

Your domain has entities. In traditional databases, you typically map an entity to a row in a table or a document in a collection.

You want to be able to know how this entity changed over time. Good luck, and try to not pick one of the horrible ways of doing this. Because there are many of those.

In order to avoid having versioned entities actually being a part of your core domain, maybe you just add a separate audit log table where you dump json blobs of each version of your entity. This can end up being many different levels of slow.

With Datomic, this is just a query away.

I wrote a separate blog post about [querying for the history of an entity](http://augustl.com/blog/2013/querying_datomic_for_history_of_entity/). This is something you can just _do_. You don't have to plan for it or adjust your domain to support it or add audit log tables or anything.

## Look at all the change detection I'm not doing

Datomic has a queue you can consume from where you get all the changes that's happening provided lazily to you in a queue. This is built right in to the Database API. You can create many of these queues, and create filters on them so you only get information about specific attributes, and so on.

There's a more general point to be made here. The reason Datomic is even able to do this, is because it is able to provide all its data structures lazily, because all the views you get of data in Datomic are immutable.

This allows you to do things like implement SSE listeners. And you can also do this in a completely generic fashion. Typically, you have to either deliberately separate the concerns between writing to the database and sending out SSE events, or you end up having SSE change code right next to the code you have for writing data. With Datomic, you can create a completely isolated section of your code, and all it has to know about is the connection object to talk to the Database. Then you set up your Datomic change listener queue and fire away. 

Additionally, you don't have to figure out yourself what specifically it was that changed. The level of granularity in Datomic are facts, which refers to a single attribute of your entities in your domain. So you don't have to do things like figuring out which of the attributes changed by comparing the previous and current version of your row or document to each other.

Thanks again, again, [val_waeselynck](https://twitter.com/val_waeselynck/status/987402104804466690)!

## Look at all the database mocking/stubbing I'm not doing

The query engine in Datomic is embedded in your app.

Internally, the query engine works on two data structures: The index trees, and a log of transactions (raw transaction data) that has not yet been merged into the tree.

Datomic calls this a "live merge", and it's borrowed from Google's Bigtable. It can't just merge new data into the index trees immediately, because that merge is an expensive operation and it would dramatically lower write throughput.

Thankfully, it has been foudn that it's very efficient to do a "live" combination of the latest version of the index trees, and the raw transaction data that has not yet been merged into the tree. This is partly because the amount of data in the unmerged log is relatively low, since it _is_ merged in, only periodically, not immediately after the transaction commits.

(Note: Obviously, the transaction log is persisted to disk as well, alongside the index trees.)

This means that one of the things the query engine can do, is to have a view of a database, take a list of raw transactions, and run queries as if those transactions are present in the database.

This _also_ means that  Datomic can very easily do this without actually writing to the transaction log, but instead keeping a in-memory list of "fake" transactions.

The only difference is that it's in-memory. The actual query engine performs the same operations.

This is very useful for writing tests. You can create an in-memory Datomic database, call the code that generates your transactions, use the `with`API to add these transactions to the "fake" transaction log, and run queries against it.

So you are able to test writes against your database **without any mocking or stubbing at all**.

Yes, you read that right.

It'll be a unit test, not an integration test, but still. Pretty cool.

Thanks again, again, again, [val_waeselynck](https://twitter.com/val_waeselynck/status/987402104804466690)!

## Look at all the up-front schema planning I'm ~~not~~ doing

Wait, what? Isn't this about what I'm _not_ doing?

In my previous post, I said the following:

> You create structure when you read, not when you write. Therefore, you get to come up with new ways of thinking about your data arbitrarily, after the fact. This is just a logical conclusion of having all the decisions about structure being put in the query engine, and not the write API. Contrary to traditional databases, where so much structure is defined up-front when you insert the data.

[/u/dustingetz](https://www.reddit.com/r/Clojure/comments/8dqes8/datomic_look_at_all_the_things_im_not_doing/dxpc1kb/) on Reddit had some very interesting insight regarding this statement.

This is a Datomic schema made by Rich Hickey himself, for Codeq, the Datomic layer on top of git:

[https://github.s3.amazonaws.com/downloads/Datomic/codeq/codeq.pdf](https://github.s3.amazonaws.com/downloads/Datomic/codeq/codeq.pdf)

That sure looks like a lot of up-front planning of schemas to me.

I'm not sure how to reconcile this yet. I think I'm right in asserting that you create structure when you read, not when you write, in Datomic. At least more so than in other databases. But I believe that /u/dustingetz is also right. Hopefully this will culminate into a new blog post some time in the future.