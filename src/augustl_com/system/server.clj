(ns augustl-com.system.server
  (:require [com.stuartsierra.component :as component]
            [optimus.prime :as optimus]
            [optimus.strategies :as strategies]
            [optimus.optimizations :as optimizations]
            [stasis.core :as stasis]
            [ring.adapter.jetty :as jetty]
            augustl-com.web))

(defrecord Server [port]
  component/Lifecycle

  (start [component]
    (if (contains? component :server)
      component
      (assoc
       component
       :server
       (jetty/run-jetty
        (->
         (stasis/serve-pages augustl-com.web/get-pages)
         (optimus/wrap augustl-com.web/get-assets optimizations/none strategies/serve-live-assets))
        {:port port
         :join? false}))))

  (stop [component]
    (if-let [server (:server component)]
      (do
        (.stop server)
        (dissoc component :server))
      component)))

(defn create-component [port]
  (Server. port))

