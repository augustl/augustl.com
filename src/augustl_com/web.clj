(ns augustl-com.web
  (:require [stasis.core :as stasis]
            [augustl-com.post-parser :as post-parser]
            [hiccup.page :refer [html5]]
            hiccup.core
            [optimus.assets :as assets]
            [optimus.optimizations :as optimizations]
            optimus.export)
  (:import [org.joda.time.format ISODateTimeFormat]))

(def base-title "August Lilleaas' blog")

(defn layout-page
  ([page] (layout-page page nil))
  ([page title]
     (html5
      [:head
       [:meta {:charset "utf-8"}]
       [:title (if (nil? title) base-title (str title "(" base-title ")"))]
       [:link {:href "/stylesheets/screen.css" :media "screen" :rel "stylesheet" :type "text/css"}]
       [:link {:href "/atom.xml" :rel "alternate" :title base-title :type "application/atom+xml"}]]
      [:body
       [:div {:class "site-header"}
        [:div {:class "site-content"}
         [:ul {:class "inline-list"}
          [:li "The personal blog of August Lilleaas."]
          [:li [:a {:href "/"} "Home"]]
          [:li [:a {:href "/about"} "About me"]]]]]
       [:div {:class "site-content site-content-main"} page]])))

(defn layout-post
  [post]
  (layout-page
   [:div {:id "article" :class "article"}
    [:h1 (get-in post [:headers :title])]
    [:p {:class "timestamp"} "Published " (:pretty-date post)]
    ((:get-body post))
    [:hr {:class "post-sep"}]
    [:p "Questions or comments?"]
    [:p
     "Feel free to contact me on Twitter, "
     [:a {:href "http://twitter.com/augustl"} "@augustl"]
     ", or e-mail me at "
     [:a {:href "mailto:august@augustl.com"} "august@augustl.com"]
     "."]]
   (:title post)))

(defn get-assets
  []
  (let [pubdir "resources/public"]
    (->> (clojure.java.io/as-file pubdir)
         (file-seq)
         (filter #(.isFile %))
         (map (fn [file] {:path (subs (.getPath file) (count pubdir))
                          :resource (.toURI file)
                          :last-modified (.lastModified file)})))))

(defn get-home-page
  [posts req]
  (layout-page
   (list
    [:h2 "Latest 10 posts"]
    (map
     (fn [post] [:p
                 [:a {:href (:url post)} (get-in post [:headers :title])]
                 (str " (" (:pretty-date post) ")")])
     (take 10 posts))
    [:hr]
    [:a {:href "/archive"} "All posts"]
    " (" [:a {:href "/atom.xml"} "RSS"] ")")))

(defn post-date-to-atom-date
  [post]
  (.print (ISODateTimeFormat/dateTime)
          (-> post (get-in [:headers :date]) (.toDateTimeAtMidnight))))

(defn get-atom-feed
  [posts req]
  (str
   "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
   (hiccup.core/html
    [:feed {:xmlns "http://www.w3.org/2005/Atom"}
     [:id "urn:augustl-com:feed"]
     [:updated (post-date-to-atom-date (first posts))]
     [:title {:type "text"} base-title]
     [:link {:href "http://augustl.com/atom.xml" :rel "self"}]
     (map
      (fn [post]
        [:entry
         [:title (hiccup.core/h (get-in post [:headers :title]))]
         [:updated (post-date-to-atom-date post)]
         [:author [:name "August Lilleaas"]]
         [:link {:href (str "http://augustl.com" (:url post))}]
         [:id (str "urn:augustl-com:feed:post:" (:id post))]
         [:content {:type "html"} (hiccup.core/h ((:get-body post)))]])
      (take 20 posts))])))

(defn get-pages
  []
  (let [posts (post-parser/get-posts "posts")]
    (merge
     {"/" (partial get-home-page posts)
      "/atom.xml" (partial get-atom-feed posts)}
     (into {} (map (fn [post] [(:url post) (fn [req] (layout-post post))]) posts)))))

(defn export
  [dir]
  (let [assets (optimizations/none (get-assets) {})]
    (stasis/empty-directory! dir)
    (optimus.export/save-assets assets dir)
    (stasis/export-pages (get-pages) dir {:optimus-assets assets})))
