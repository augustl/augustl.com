(ns augustl-com.export
  (:require augustl-com.web
            [optimus.optimizations :as optimizations]
            optimus.export
            [stasis.core :as stasis]))

(defn export
  [dir]
  (let [assets (optimizations/none (augustl-com.web/get-assets) {})]
    (println "Cleaning previously generated files")
    (stasis/empty-directory! dir)

    (println "Saving static assets")
    (optimus.export/save-assets assets dir)

    (println "Exporting all pages")
    (stasis/export-pages (augustl-com.web/get-pages) dir {:optimus-assets assets})

    (println "Voila!")
    (System/exit 0)))
