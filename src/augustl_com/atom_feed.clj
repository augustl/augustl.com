(ns augustl-com.atom-feed
  (:require hiccup.core
            [augustl-com.util :as util])
  (:import [org.joda.time.format ISODateTimeFormat]))

(defn post-date-to-atom-date
  [post]
  (.print (ISODateTimeFormat/dateTime)
          (-> post (get-in [:headers :date]) (.toDateTimeAtMidnight))))

(defn get-atom-feed
  [posts title req]
  (str
   "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
   (hiccup.core/html
    [:feed {:xmlns "http://www.w3.org/2005/Atom"}
     [:id "urn:augustl-com:feed"]
     [:updated (post-date-to-atom-date (first posts))]
     [:title {:type "text"} title]
     [:link {:href "http://augustl.com/atom.xml" :rel "self"}]
     (map
      (fn [post]
        [:entry
         [:title (hiccup.core/h (get-in post [:headers :title]))]
         [:updated (post-date-to-atom-date post)]
         [:author [:name "August Lilleaas"]]
         [:link {:href (str "http://augustl.com" (:url post))}]
         [:id (str "urn:augustl-com:feed:post:" (:id post))]
         [:content {:type "html"} (hiccup.core/h (util/get-post-body post))]])
      (take 20 posts))])))
