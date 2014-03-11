(ns augustl-com.dev-server
  (:require [ring.adapter.jetty :as jetty]
            [stasis.core :as stasis]
            augustl-com.web))

(defn run
  [port]
  (jetty/run-jetty
   (stasis/serve-pages augustl-com.web/get-pages)
   {:port (Integer/parseInt port)
    :join? true}))
