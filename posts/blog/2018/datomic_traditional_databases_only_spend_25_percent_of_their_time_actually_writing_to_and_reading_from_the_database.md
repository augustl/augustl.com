date: 2018.04.20
title: Datomic: Traditional databases only spend about 25% of their time actually writing to and reading from the database
series: datomic

This post is about how Datomic (and Volt DB, and a few other databases) are different from traditional databases.

It turns out that OLTP databases [spend 75% of their time coordinating reads and writes](http://nms.csail.mit.edu/~stavros/pubs/OLTP_sigmod08.pdf). That means that 75% of the time, the database isn't actually running queries and writing data, but is instead figuring out safe ways to allow multiple concurrent clients to perform reads and writes in parallel.

Volt DB figured out that with modern hardware, you can get much better performance if you instead partition your dataset across N cores, and have those cores do uncoordinated reads and writes to their respective partitions, and then when you _do_ need consistency across partitions, the coordinator can step in.

Datomic is completely single threaded when it comes to writes. (And infinitely multi threaded, without coordination, when it comes to reads.)

It turns out that even on today's multi threaded hardware, having a single core do useful work close to 100% of the time, is actually quite efficient.

So when you hear that Datomic has a single threaded writer, maybe that's not such a bad idea after all. You get unparalleled consistency (pun intended), on top of a writer that might actually be performing better than what your gut feeling tells you.