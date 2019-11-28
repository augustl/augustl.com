(ns augustl-com.util
  (:import (com.vladsch.flexmark.html HtmlRenderer)
           (com.vladsch.flexmark.parser Parser)))

(defmulti get-post-body :extension)

(defmethod get-post-body "md" [post]
  (let [parser (.build (Parser/builder))
        renderer (.build (HtmlRenderer/builder))
        node (.parse parser ((:get-body post)))]
    (.render renderer node)))

(defmethod get-post-body :default [post]
  ((:get-body post)))