(ns augustl-com.web
  (:require [augusts-fancy-blog-post-parser.core :as post-parser]
            [augustl-com.atom-feed :as atom-feed]
            [hiccup.page :refer [html5]]
            [optimus.assets :as assets]))

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
          [:li base-title]
          [:li [:a {:href "/"} "Home"]]
          [:li [:a {:href "/about"} "About me"]]
          [:li [:small [:a {:href "https://github.com/augustl/augustl.com"} "Blog source code"]]]]]]
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

(defn get-archive-page
  [posts req]
  (layout-page
   (list
    [:h1 "Archive"]
    (map
     (fn [[year posts]]
       (list
        [:h2 year]
        (map
         (fn [post]
           [:p [:a {:href (:url post)} (get-in post [:headers :title])] " (" (:pretty-date post) ")"])
         posts)))
     (group-by #(-> % :headers :date (.getYear)) posts)))))

(defn get-about-page
  [req]
  (layout-page
   (list
    [:h1 "Who am I?"]
    [:p "I'm August Lilleaas. I " [:a {:href "http://kodemaker.no"} "work for Kodemaker"] " as a contracting programmer. I live in Eidsvoll, Norway, with my wife, a cat, and my daughter."]
    [:p "I'm on Twitter as " [:a {:href "http://twitter.com/augustl"} "@augustl"] ", my e-mail is " [:a {:href "mailto:august@augustl.com"} "august@augustl.com"] " and I have some stuff on " [:a {:href "http://github.com/augustl"} "Github"] "."])))

(defn get-assets
  []
  (assets/load-assets "public" [#".*"]))

(defn get-pages
  []
  (let [posts (post-parser/get-posts "posts")
        listed-posts (remove #(contains? (:headers %) :unlisted) posts)]
    (merge
     {"/" (partial get-home-page listed-posts)
      "/about" get-about-page
      "/archive" (partial get-archive-page listed-posts)
      "/atom.xml" (partial atom-feed/get-atom-feed listed-posts base-title)}
     (into {} (map (fn [post] [(:url post) (fn [req] (layout-post post))]) posts)))))
