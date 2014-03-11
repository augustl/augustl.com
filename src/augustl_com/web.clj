(ns augustl-com.web
  (:require [stasis.core :as stasis]
            [augustl-com.post-parser :as post-parser]
            [hiccup.page :refer [html5]]
            [org.satta.glob :refer [glob]]))

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

(defn get-pages
  []
  (let [posts (->> (concat (glob "posts/*/*/*.html") (glob "posts/dump/*/*/*.html"))
                   (map post-parser/parse)
                   (sort-by #(get-in % [:headers :date]) #(.compareTo %2 %1)))]
    (merge
     (stasis/slurp-directory "resources/public" #".*\.(html|css|js)$")
     {"/" (partial get-home-page posts)}
     (into {} (map #(vector (:url %) (fn [req] ((:get-body %)))) posts)))))

(defn export
  [dir]
  (stasis/empty-directory! dir)
  (stasis/export-pages (get-pages) dir))
