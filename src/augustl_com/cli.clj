(ns augustl-com.cli
  (:require [ring.adapter.jetty :as jetty]
            [stasis.core :as stasis]
            augustl-com.web
            [optimus.prime :as optimus]
            [optimus.optimizations :as optimizations]
            [optimus.strategies :refer [serve-live-assets]]
            optimus.export))

(def optimize optimizations/all)

(defn run
  [port]
  (jetty/run-jetty
   (->
    (stasis/serve-pages augustl-com.web/get-pages)
    (optimus/wrap augustl-com.web/get-assets optimize serve-live-assets))
   {:port (Integer/parseInt port)
    :join? true}))


(defn export
  [dir]
  (let [assets (optimize (augustl-com.web/get-assets) {})]
    (println "Cleaning previously generated files")
    (stasis/empty-directory! dir)

    (println "Saving static assets")
    (optimus.export/save-assets assets dir)

    (println "Exporting all pages")
    (stasis/export-pages (augustl-com.web/get-pages) dir {:optimus-assets assets})

    (println "Voila!")
    (System/exit 0)))

