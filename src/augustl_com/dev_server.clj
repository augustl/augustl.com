(ns augustl-com.dev-server
  (:require [ring.adapter.jetty :as jetty]
            [stasis.core :as stasis]
            augustl-com.web
            [optimus.prime :as optimus]
            [optimus.optimizations :as optimizations]
            [optimus.strategies :refer [serve-live-assets]]))

(defn run
  [port]
  (jetty/run-jetty
   (->
    (stasis/serve-pages augustl-com.web/get-pages)
    (optimus/wrap augustl-com.web/get-assets optimizations/none serve-live-assets))
   {:port (Integer/parseInt port)
    :join? true}))
