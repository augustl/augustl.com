(ns augustl-com.util
  (:import (org.pegdown PegDownProcessor)))

(defmulti get-post-body :extension)

(defmethod get-post-body "md" [post]
  (.markdownToHtml (PegDownProcessor.) ((:get-body post))))

(defmethod get-post-body :default [post]
  ((:get-body post)))