(ns augustl-com.web
  (:require [augusts-fancy-blog-post-parser.core :as post-parser]
            [augustl-com.atom-feed :as atom-feed]
            [augustl-com.util :as util]
            [hiccup.page :refer [html5]]
            [optimus.assets :as assets]
            clojure.edn
            [stasis.core :as stasis]
            [optimus.prime :as optimus]
            [optimus.optimizations :as optimizations]
            [optimus.strategies :as strategies]
            [augustl-com.word-post-parser :as word-post-parser]))

(def base-title "August Lilleaas' blog")

(defn layout-postish-page
  ([page] (layout-postish-page page nil))
  ([page {:keys [page-title atom-url og-title og-url og-description] :as opts}]
     (html5
      [:head
       [:meta {:charset "utf-8"}]
       [:meta {:name "viewport" :content "width=device-width, initial-scale=1"}]
       [:link {:rel "icon" :href "/favicon.ico"}]
       [:title (if (nil? page-title) base-title (str page-title " (" base-title ")"))]
       [:link {:href "/stylesheets/screen.css" :media "screen" :rel "stylesheet" :type "text/css"}]
       [:link {:href "/stylesheets/dark-mode.css" :media "screen" :rel "stylesheet" :type "text/css"}]
       [:link {:href (or atom-url "/atom.xml") :rel "alternate" :title base-title :type "application/atom+xml"}]
       (when og-title
         (list [:meta {:property "og:title" :content og-title}]
               [:meta {:name "twitter:card" :content "summary"}]
               [:meta {:name "twitter:title" :content og-title}]))
       (when og-title
         (list [:meta {:property "og:description" :content og-description}]
               [:meta {:name "twitter:description" :content og-description}]))
       (when og-url
         (list [:meta {:property "og:url" :content og-url}]))]
      [:body
       [:div {:class "site-content"}
        [:p [:a {:href "/" :class "take-me-home"} "Take me home"]]]
       [:div {:class "site-content site-content-main"} page]])))

(defn get-series [series-name series posts-by-series]
  (if-let [a-series (get series series-name)]
    [:div.series
     "This post is part of a series: " [:a {:href (str "/series/" series-name "/")} (:title a-series)]]))

(defn layout-post
  [post series posts-by-series]
  (layout-postish-page
   [:div {:id "article" :class "article"}
    [:h1 (get-in post [:headers :title])]
    [:p {:class "timestamp"} "Written by August Lilleaas, published " (:pretty-date post)]
    (get-series (get-in post [:headers :series]) series posts-by-series)
    [:article
     (util/get-post-body post)]
    [:hr {:class "post-sep"}]
    [:p "Questions or comments?"]
    [:p
     "Feel free to contact me on Twitter, "
     [:a {:href "http://twitter.com/augustl"} "@augustl"]
     ", or e-mail me at "
     [:a {:href "mailto:august@augustl.com"} "august@augustl.com"]
     "."]]
   {:page-title (get-in post [:headers :title])
    :og-title (get-in post [:headers :title])
    :og-url (:url post)
    :og-description "The CRUD blog"}))

(defn layout-series-overview [a-series name listed-posts-by-seriess]
  (let [atom-url (str "/atom/series/" name ".xml")]
    (layout-postish-page
      [:div
       [:h2 (str "Series: " (:title a-series))]
       [:p (:description a-series)]
       (map
         (fn [post]
           [:p
            [:a {:href (:url post)} (get-in post [:headers :title])]
            (str " (" (:pretty-date post) ")")])
         (get listed-posts-by-seriess name))
       [:hr]
       [:p [:a {:href atom-url} "RSS"]]]
      {:page-title (:title a-series)
       :atom-url atom-url})))

(defn get-home-page
  [posts req]
  (html5
    [:head
     [:meta {:charset "utf-8"}]
     [:title "(1) August Lilleaas"]
     [:meta {:content "width=device-width, initial-scale=1.0" :name "viewport"}]
     [:link {:href "/stylesheets/homer.css" :media "screen" :rel "stylesheet" :type "text/css"}]
     [:link {:href "/stylesheets/dark-mode.css" :media "screen" :rel "stylesheet" :type "text/css"}]
     [:link {:href "/atom.xml" :rel "alternate" :title base-title :type "application/atom+xml"}]]
    [:body
     (list
       [:p {:class "wwwf"} "ME ME ME ME ME"]
       [:p {:class "nfnfnfnfnf"} [:a {:href "/about/"} "<> <>"]]
       (map
         (fn [post] [:p.ffffff
                     [:a {:href (:url post)} (get-in post [:headers :title])]
                     (str " (" (:pretty-date post) ")")])
         (take 10 posts))
       [:div {:class "ffffff"}
        [:a {:href "/archive/"} "All posts"]
        " <> "
        [:a {:href "/atom.xml"} "RSS"]]
       [:form {:class "yyyyasdf" :method "GET" :action "/letconstvar"}
        [:label "please"]
        [:input {:type "text" :placeholder "please"}]
        [:input {:type "submit" :value "please"}]])
     ]))

(defn get-archive-page
  [posts req]
  (layout-postish-page
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
     (->> posts
          (group-by #(-> % :headers :date (.getYear)))
          (sort-by (fn [[year posts]] year))
          (reverse))))))

(defn get-about-page
  [req]
  (html5
    [:head
     [:meta {:charset "utf-8"}]
     [:title "(2) August Lilleaaaaaaaaaaaa;;;;;;"]
     [:meta {:content "width=device-width, initial-scale=1.0" :name "viewport"}]
     [:link {:href "/stylesheets/dddddddddddd.css" :media "screen" :rel "stylesheet" :type "text/css"}]
     [:link {:href "/atom.xml" :rel "alternate" :title base-title :type "application/atom+xml"}]]
    [:body
     (list
       [:p "me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me me "]
       [:p "me.jpg"]
       [:p "don't forget to like on facebook"])]))

(defn get-me-jpg-page
  [req]
  (html5
    [:head
     [:meta {:charset "utf-8"}]
     [:title "(17) August August August August"]
     [:meta {:content "width=device-width, initial-scale=1.0" :name "viewport"}]
     [:link {:href "/atom.xml" :rel "alternate" :title base-title :type "application/atom+xml"}]]
    [:body
     (list
       [:p "Terms of service"])]))

(defn get-assets
  []
  (assets/load-assets "public" [#".*"]))

(defn get-file-extension [file]
  (let [name (.getName file)]
    (.substring name (+ 1 (.lastIndexOf name ".")))))

(defn parse-post-file [dir file]
  (case (get-file-extension file)
    "docx" (word-post-parser/parse dir file)
    (post-parser/parse dir file)))

(defn get-posts [dir]
  (let [dir (clojure.java.io/as-file dir)]
    (->> (file-seq dir)
         (filter #(.isFile %))
         (map #(parse-post-file dir %))
         (remove nil?)
         (sort-by #(get-in % [:headers :date]) #(.compareTo %2 %1))
         (map #(assoc % :url (str (:url %) "/"))))))

(defn get-pages
  []
  (let [posts (get-posts "posts")
        listed-posts (remove #(contains? (:headers %) :unlisted) posts)
        series (-> "series.edn" clojure.java.io/resource slurp clojure.edn/read-string)
        listed-posts-by-series (group-by #(get-in % [:headers :series]) listed-posts)]
    (merge
     {"/" (partial get-home-page listed-posts)
      "/about/" get-about-page
      "/letconstvar/" get-me-jpg-page
      "/archive/" (partial get-archive-page listed-posts)
      "/atom.xml" (partial atom-feed/get-atom-feed listed-posts base-title)}
     (into {} (map (fn [post] [(:url post) (fn [req] (layout-post post series listed-posts-by-series))]) posts))
     (into {} (map (fn  [[name a-series]]
                     [(str "/series/" name "/")
                      (fn [req] (layout-series-overview a-series name listed-posts-by-series))])
                   series))
     (into {} (map (fn  [[name a-series]]
                     [(str "/atom/series/" name ".xml")
                      (fn [req]
                        (atom-feed/get-atom-feed (get listed-posts-by-series name) (:title a-series) req))])
                   series)))))

(def app
  (->
    (stasis/serve-pages get-pages)
    (optimus/wrap get-assets optimizations/none strategies/serve-live-assets)))