(ns augustl-com.util
  (:import (com.vladsch.flexmark.html HtmlRenderer)
           (com.vladsch.flexmark.parser Parser)
           (com.vladsch.flexmark.ext.tables TablesExtension)
           (com.vladsch.flexmark.util.data MutableDataSet)))

(defmulti get-post-body :extension)

(def opts (-> (MutableDataSet.)
              (.set Parser/EXTENSIONS [(TablesExtension/create)])))

(defmethod get-post-body "md" [post]
  (let [parser (.build (Parser/builder opts))
        renderer (.build (HtmlRenderer/builder opts))
        node (.parse parser ((:get-body post)))]
    (.render renderer node)))

(defmethod get-post-body :default [post]
  ((:get-body post)))