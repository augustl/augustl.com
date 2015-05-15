(ns user
  (:require [reloaded.repl :refer [system init start stop go reset]]
            [augustl-com.system :as system]))

(reloaded.repl/set-init! #(system/new-system {:port 3000}))


