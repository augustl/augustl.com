(ns user
  (:require [ring.adapter.jetty]
            [augustl-com.web :refer [app]]))

(declare server)

(defn start-server []
  (defonce server (ring.adapter.jetty/run-jetty #'app {:port 3000 :join? false}))
  (.start server))

(defn stop-server []
  (.stop server))


