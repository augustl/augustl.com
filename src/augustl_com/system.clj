(ns augustl-com.system
  (:require [com.stuartsierra.component :as component]
            augustl-com.system.server))

(defn new-system [opts]
  (component/system-map
   :server (augustl-com.system.server/create-component (:port opts 0))))
