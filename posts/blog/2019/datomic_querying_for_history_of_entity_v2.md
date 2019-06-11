date: 2019.06.11
title: Datomic: Querying for the history of an entity (v2)
series: datomic

This is the updated and rewritten version of an [old classic](https://augustl.com/blog/2013/querying_datomic_for_history_of_entity/).

## Intro: how is this even possible?

Datomic makes it easy to implement an "audit log" of changes over time to anything in your system.

You _could_ implement your own. But when you have Datomic, you are one abstraction level above other databases. And there are [many ways to get that wrong](https://augustl.com/blog/2018/datomic_look_at_all_the_things_i_am_not_doing/). So you don't have to think of this when modelling your data. The power is already there. You just have to know how to query the data out of Datomic.

## The history database

Normally, you transact facts into your database, and your schema determines what the "current view" of the database is like.

Let's say we have the following history of transactions:

<pre><code data-lang="clojure">
;; The three transactions that we write to the database

;; tx 1
[[:db/add 1 :user/email "august@augustl.com"] [:db/add 1 :user/password "hash-here"]]

;; tx 2
[[:db/add 1 :user/subscribed-to-newsletter? true]]

;; tx 3
[[:db/add 1 :user/email "august@kodemaker.no"]]
</code></pre>

We pull out a view of the database:

<pre><code data-lang="clojure">
;; Set up
(require '[datomic.api :as d])

(def my-db (d/db my-conn))

(def my-eid 123654) ;; The assumed entity ID created above (`[:db/add 1 ...]`)
</code></pre>

When you query `my-db`, you'll see a "current view" of the data, without any history. If you ask the db for the `:user/email` of user `1`` you'll get:

<pre><code data-lang="clojure">
;; Just "latest data"
(d/q '[:find ?email :in $db ?eid :where [?eid :user/email ?email]] my-db my-eid)
;; => returns
#{["august@kodemaker.no"]}
</code></pre>

However, you can also ask for the "history" db. If you ask _that_ for the value of the `:user/email` of user `1`` you'll get:

<pre><code data-lang="clojure">
;; All historical data, just like that!
(def my-history-db (d/history my-db))

(d/q '[:find ?email :in $db ?eid :where [?eid :user/email ?email]] my-history-db my-eid)
;; => returns
#{["august@augustl.com"] ["august@kodemaker.no"]}
</code></pre>

The "history" db is a special view of the database that doesn't filter out previously added data.

## Inspect the history

All Datomic facts contains information about which transaction the fact was added in. This is particularly useful for querying the history database.

This query will return a list of all changes made to the entity`, with information about the transaction in where it was added, the attribute in question, and whether that attribute was added or removed in that transaction.

<pre><code data-lang="clojure">
;; All changes made to entity my-eid
(def res
  (d/q
    '[:find ?tx ?attr ?added
      :in $ ?e
      :where
      [?e ?attr _ ?tx ?added]]
    (d/history db)
    my-eid))
;; => returns
#{[13194139534318 63 true]
  [13194139534313 63 true]
  [13194139534317 65 true]
  [13194139534313 64 true]
  [13194139534318 63 false]}
</code></pre>

This data structure is pretty bare metal. What follows are some examples of how to use it.
 
## Making sense of the daa

We don't really do anything here other than restructuring the data to make it look more intuitive.
 
<pre><code data-lang="clojure">
;; More prettier
(def txs
  (->> res
       (group-by first)
       (map (fn [[k v]] [k (map (fn [[tx attr added]] {:attr attr :added? added}) v)]))
       (sort-by (fn [[k v]] k))))
;; => returns
([13194139534313 ({:attr 63, :added? true} {:attr 64, :added? true})]
 [13194139534317 ({:attr 65, :added? true})]
 [13194139534318 ({:attr 63, :added? true} {:attr 63, :added? false})])
</code></pre>

Here we se the three transactions we did above. The first transaction contains the two "added" items, the email and the password. The second transaction contains the added newsletter subscription. The third transaction contains the removed old e-mail and the added new e-mail.
 
You can use this query power to do lots of neat things.

It also exposes an interesting detail about Datomic internals. Attributes themselves (`?attr`) are _also_ represented entities in the Datomic database, and can be queried fully. As well as the transactions themselves, of course.

## Generate a list of entities before/after, whith a timestamp

Our raw data is not that interesting, so let's do something about that.

<pre><code data-lang="clojure">
;; List of changes, with the full entity as of before and after the change was made
(->> res
     (map first)
     (set)
     (sort)
     (map
       (fn [tx-eid]
         (let [tx (d/entity my-db tx-eid)]
           {:timestamp (:db/txInstant tx)
            :ent-before (d/entity (d/as-of my-db (dec (d/tx->t tx-eid))) my-eid)
            :ent-after (d/entity (d/as-of my-db tx-eid) my-eid))})))
</code></pre>

Here's what we get back

<pre><code data-lang="clojure">
;; => returns
(
;; The first TX
{:timestamp #inst"2019-06-11T13:53:09.055-00:00",
  :ent-before #:db{:id 17592186045418},
  :ent-after {:db/id 17592186045418, 
              :user/email "august@augustl.com", 
              :user/password "hash-123-abc"}}

;; The second TX
 {:timestamp #inst"2019-06-11T13:54:12.693-00:00",
  :ent-before {:db/id 17592186045418, 
               :user/email "august@augustl.com", 
               :user/password "hash-123-abc"},
  :ent-after {:db/id 17592186045418,
              :user/email "august@augustl.com",
              :user/password "hash-123-abc",
              :user/subscribed-to-newsletter? true}}
;; The third TX
 {:timestamp #inst"2019-06-11T13:54:22.530-00:00",
  :ent-before {:db/id 17592186045418,
               :user/email "august@augustl.com",
               :user/password "hash-123-abc",
               :user/subscribed-to-newsletter? true},
  :ent-after {:db/id 17592186045418,
              :user/email "august@kodemaker.no",
              :user/password "hash-123-abc",
              :user/subscribed-to-newsletter? true}}
)
</code></pre>

There are a couple of intersting to note here.

Note how we get what seems like a full entity with an id from `:ent-before` in the first tx. This is because the Datomic `(d/entity)` API does not actually check whether any facts exists for an entity before generating an `EntityMap` data structure.

The essential data structure here is just a sorted list of TX ids. We can safely sort on transaction ID, since the transaction is a monotone sequence.

We also use a special trick. We have a list of transactions, but how do we get the entity as of right before that transaction? We use `(d/tx->t)` to get the "T" value of the tx, i.e. its internal monotone sequence number that we can pass to "as-of". If we decrement that number, we'll get the transaction before tx. This is guaranteed by Datomic.

This is a slighly more practical version of the "real" way, which would be to map over pairs of transaction A+B, B+C, C+D etc.

## Generate a list of entities with the timestamp, and a list of attributes that changed, and to which value

This is pretty simple when we have our existing query over the history db.

To make things slightly more interesting, let's add a fourth transaction, that doesn't update anything, but just deletes an attribute. Let's assume that the password expired or something like that, so we retract the hash from the database.

<pre><code data-lang="clojure">
;; Add some more data - retract (delete/remove/wipe) an attribute

;; tx 4
[[:db/retract 1 :user/password "hash-123-abc"]]

;; Pull out reference to latest db
(def my-db (d/db my-conn))
</code></pre>


Note that if we didn't re-assign my-db, we'd still get the old view without transaction 4, even though we use the history db. The history db is still an immutable reference to a point in time, it's just that it contains all of the history up until that point, not just the data directly visible in the index in the normal db view.

Now, let's generate the data we need.

<pre><code data-lang="clojure">
;; Complete diff of changes made over time to an entity
(->> (d/q
       '[:find ?tx ?attr ?val ?added
         :in $ ?e
         :where
         [?e ?attr ?val ?tx ?added]]
       (d/history my-db)
       my-eid)
     (group-by first)
     (map (fn [[tx v]]
            [tx
             (->> v
                  (group-by (fn [[tx attr val added]] attr))
                  (map (fn [[attr changes]]
                         [(d/ident my-db attr)
                          (map (fn [[tx attr val added?]] {:val val :added? added?})
                               changes)])))]))
     (sort-by (fn [[tx v]] tx)))
</code></pre>

When we look at the data, we can see that we have everything we need in order to generate a useful GUI.

<pre><code data-lang="clojure">
;; => returns
(
 ;; tx 1
 [13194139534313 (
   [:user/password ({:val "hash-123-abc", :added? true})] 
   [:user/email ({:val "august@augustl.com", :added? true})])]
  
 ;; tx 2
 [13194139534317 (
   [:user/subscribed-to-newsletter? ({:val true, :added? true})])]
 
 ;; tx 3
 [13194139534318 (
   [:user/email ({:val "august@kodemaker.no", :added? true}
                 {:val "august@augustl.com", :added? false})])]
  
 ;; tx 4
 [13194139534319 (
   [:user/email ({:val "august@kodemaker.no", :added? false})])])
</code></pre>

## Look at all the things I'm not doing

If you don't use Datomic, you can always implement this yourself. And figure out all the wrong ways to do it before you end up with something useful (and performant).

But what if you get this requirement when your app is already up and running in production?

Well, a buddy of mine has done just that. They did _not_ have an audit log requirement up front. But since this is not an up-front decision you have to make, you can be completely oblivious to this, and just add it later, in the forms of queries.

Check it out! It starts around 24:00.

<iframe src="https://player.vimeo.com/video/234054197?color=ff9933&portrait=0" width="640" height="360" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>

