(ns augustl-com.web
  (:require [stasis.core :as stasis]
            [augustl-com.post-parser :as post-parser]
            [augustl-com.atom-feed :as atom-feed]
            [hiccup.page :refer [html5]]
            [optimus.assets :as assets]
            [optimus.optimizations :as optimizations]
            optimus.export))

(def base-title "August Lilleaas' blog")

(defn layout-page
  ([page] (layout-page page nil))
  ([page title]
     (html5
      [:head
       [:meta {:charset "utf-8"}]
       [:title (if (nil? title) base-title (str title " (" base-title ")"))]
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
   (get-in post [:headers :title])))

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

(defn get-about-page
  [req]
  (layout-page
   (list
    [:h1 "About me"]
    [:p "Hi, I'm August Lilleaas. I " [:a {:href "http://kodemaker.no"} "work for Kodemaker"] " as a consultant. I live in Oslo, Norway, with my wife, a cat, and my daughter. My only education is a half-finished bachelor's degree in classical piano from the Norwegian Academy of Music."]
    [:p "I'm on Twitter as " [:a {:href "http://twitter.com/augustl"} "@augustl"] ", my e-mail is " [:a {:href "mailto:august@augustl.com"} "august@augustl.com"] " and I have some stuff on " [:a {:href "http://github.com/augustl"} "Github"] "."])))

(defn get-pages
  []
  (let [posts (post-parser/get-posts "posts")]
    (merge
     {"/" (partial get-home-page posts)
      "/about" get-about-page
      "/atom.xml" (partial atom-feed/get-atom-feed posts base-title)}
     (into {} (map (fn [post] [(:url post) (fn [req] (layout-post post))]) posts)))))

(defn export
  [dir]
  (let [assets (optimizations/none (get-assets) {})]
    (println "Cleaning previously generated files")
    (stasis/empty-directory! dir)
    (println "Saving static assets")
    (optimus.export/save-assets assets dir)
    (println "Exporting all pages")
    (stasis/export-pages (get-pages) dir {:optimus-assets assets})
    (println "Voila!")
    (System/exit 0)))
