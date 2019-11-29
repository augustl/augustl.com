date: 2019.12.06
title: DevOps: The magic of going back in time with Datomic
series: advent_calendar_2019
unlisted: true

I'm a bit of a [Datomic](https://www.datomic.com/) fan. That's a bit of an understatement.

I'm going to tell you a DevOps story today, about Marzia and Felix. They are both DevOps experts, delivering quality software at breakneck speeds. Marzia uses Datomic, and Felix uses PostgreSQL. Let's see what their DevOps lives are like.

## It's 11:30pm, almost midnight

Felix is sleeping.

The System is operational. Everything is running A-OK. No alerts are triggered, no warnings are active. 

Earlier today, Felix deployed to production. Four times, actually! Four nice and tidy incremental changes. DevOps, yay!

The System receives orders from other systems in the organization. Felix is experienced and smart, so he has created an audit log table in postgres that stores all the incoming orders. It's great to be able to replay stuff if it goes wrong. 

It's _possible_ that The System has a complete meltdown and that orders are missed - but that doesn't matter. What matters, is that when everything is up and running, and some validation error or other software bug fails to process the order, it can simply be reprocessed by finding it in the orders audit log.

It's 11:30pm. An order fails.

Nobody is alerted. This is just normal business. The other system that posted the order to us got an error mesage back. It's their responsibility to retry until it works.
 
## It's 08:41am, the next day

Felix just arrived at the office.

The Boss asks Felix why the order failed. It was an important order, and the system that sent it to us hasn't retried it.

Cool! We have an audit log, so let's try! We just send it again. We don't have to spend time digging in the logs to find the first failure.

It succeeds.

(Have you ever told yourselv: "damn, I wish it didn't work?". That's normal. It happens to engineers all the time.)

The Boss tells Felix that he changed some of the rules in the admin setup this morning, before Felix arrived. The admin setup is very powerful and flexible. Lots of grids and configs to tweak and adjust how orders are processed.

Oh well. It worked. We're not sure why it failed.

Moving on!

## It's 11:30pm, almost midnight.

Marzia is sleeping.

The System is operational. Everything is running A-OK. No alerts are triggered, no warnings are active.

Earlier today, Marzia deployed to production. Four times, actually! Four nice and tidy incremental changes. DevOps, yay!

The System receives orders from other systems in the organization. Marzia is a fan of Datomic, so she stores all the rules about how to process orders, and all the data about the orders themselves, as well as the raw input data that The System receives, in Datomic. 

They use redis for some other things, and Riak as well. It's nice to be able to use different databases with different semantics for different parts of the system.

It's 11:30pm. An order fails.

Nobody is alerted. This is just normal business. The other system that posted the order to us got an error mesage back. It's their responsibility to retry until it works.

## It's 08:41am, the next day

Marzia just arrived at the office.

The Boss asks Marzia why the order failed. It was an important order, and the system that sent it to us hasn't retried it.

Cool! We use Datomic, so we have full access to the historical information about all the data in our system.

(Say what?)

The Boss tells Marzia that he changed some of the rules in the admin setup this morning, before Marzia arrived.

Marzia finds the transaction where the boss changed the rules.

(Say _what??_)

<pre><code data-lang="clojure">
;; Finds all transactions by boss-user
(->> (d/q '[:find [?tx ...]
            :in $ ?boss-id
            :where
            [?tx :tx/changed-by ?boss-id]]
       (d/history db-3)
       (:db/id boss-user))
     ;; Get the last 3 ones
     (sort)
     (reverse)
     (take 3)
     (map
       (fn [tx]
              ;; Get raw data from transaction log for this tx
         (->> (d/tx-range db-log tx (inc tx))
              (first)
              :data
              ;; Remove noise we don't want
              (filter (fn [[e a v t added?]] (and added? (not= e tx))))
              ;; Give us the good stuff
              (map (fn [[e a v]]
                     {:id e
                      :attr (d/ident db-3 a)
                      :val v}))))))
</code></pre>

Marzia could have asked for more than the 3 latest ones, but decided that 3 was a good start. Here's what Marzia gets back from that query.

<pre><code data-lang="clojure">
({:timestamp #inst"2019-11-28T07:54:28.102-00:00",
  :changes 
  ({:id 17592186045421, 
    :attr :order-rule/zip-code, :val "0061", :added? true}
   {:id 17592186045421, 
     :attr :order-rule/zip-code, :val "0056", :added? false})}
   
 {:timestamp #inst"2019-11-28T07:53:58.031-00:00",
   :changes 
   ({:id 17592186092838, 
     :attr :customer/name, :val "Some Flower Shop", :added? true}
    {:id 17592186092838, 
     :attr :customer/department, :val 17592186860812, :added? true})}
    
 {:timestamp #inst"2019-11-28T07:52:01.511-00:00",
   :changes 
   ({:id 17592186089123, 
     :attr :customer/name, :val "Some Office", :added? true}
    {:id 17592186089123, 
      :attr :customer/name, :val "Some Offcie", :added? false})})
</code></pre>

There we go! Marzia found three transactions, performed around 07:55. The oldest one fixed a spelling error in a customer name, the second one added a new customer and set its name and assigned it to a department, and the most recent one changed an `:order-rule/zip-code` from "0056" to "0061".

Marzia knows that the zip code is important to the routing, and the change of zip codes triggered some rules that were changed by a code change the day before.


And the order that failed was related to the department that order rule is assigned to.

<pre><code data-lang="clojure">
(d/q
  '[:find [?rule-id ...]
    :in $ ?order-id
    :where
    [?order-id :order/zip-code ?zip-code]
    [?rule-id :order-rule/zip-code ?zip-code]]
  db
  failed-order-id)  
;; => #{17592186045421}
</code></pre>


Jut to be on the safe side, Marzia checks that the order rule in question was actually associated with the same department around the time the order failed. This can be done easily, by running the same query again, but running it with the database `as-of` a provided timestamp.

<pre><code data-lang="clojure">
(d/q
  '[:find [?rule-id ...]
    :in $ ?order-id
    :where
    [?order-id :order/zip-code ?zip-code]
    [?rule-id :order-rule/zip-code ?zip-code]]
  (d/as-of db #inst "2019-11-27T23:30:00.000")
  failed-order-id)  
;; => #{17592186045421}
</code></pre>

Marzia could also have checked the full history, in case it changed departments rapidly back and forth for some reason, but decides to leave it at that. 


## Retrospective

Felix had an audit log, but not much else.

Marzia queried the Datomic database, and had all the info readily available.

Datomic keeps the history for _all_ the changes across the database over time. Datomic also treats transactions as first class entities, so the only "clever" thing that was done here was to make sure to tag transactions with the user that performed the change, so that it's easy to find that later on.

<pre><code data-lang="clojure">
(d/transact conn 
  [[:db/add (:db/id my-order-rule) :order-rule/zip-code "0061"]
   [:db/add "datomic.tx" :tx/changed-by (:db/id boss-user)]])
</code></pre>

This is a DevOps superpower. You can track your data as it changes and churns, across deploys and code changes, and all the way back to the beginning of time. And it's just there, out of the box, you don't have to think up the use cases for time tracking up front.

You can and should create audit logs. But it's super nice to be able to have _all_ of the data that governs your system with change tracking.

You do it with your source code. You should also do it with critical business data.