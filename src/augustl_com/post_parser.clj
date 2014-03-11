(ns augustl-com.post-parser
  (:require clj-time.format)
  (:import [org.joda.time LocalDate]
           [org.joda.time.format DateTimeFormat]))

(def date-formatter (DateTimeFormat/forPattern "yyyy.MM.dd"))
;; (February 27, 2014)
(def pretty-date-formatter (DateTimeFormat/forPattern "MMMM dd, yyyy"))

(defn parse-date
  [date-str]
  (LocalDate/parse date-str date-formatter))

(defn parse-headers
  [header-lines]
  (->
   (into {} (map  #(let [[k v] (clojure.string/split % #": ?" 2)] [(keyword k) v]) header-lines))
   (update-in [:date] (fn [date] (parse-date date)))))

(defn parse-body
  [file]
  (with-open [r (clojure.java.io/reader file :encoding "UTF-8")]
    (->> (line-seq r)
         (drop-while (comp not clojure.string/blank?))
         (rest)
         (clojure.string/join "\n"))))

(defn remove-file-extension
  [path]
  (->> (clojure.string/split path #"\.")
       (butlast)
       (clojure.string/join ".")))

(defn assoc-pretty-date
  [post]
  (assoc post :pretty-date (.print pretty-date-formatter (get-in post [:headers :date]))))

(defn parse
  [file]
  (with-open [r (clojure.java.io/reader file :encoding "UTF-8")]
    (-> {:url (remove-file-extension (subs (.getPath file) 7))
         :headers (parse-headers (take-while (comp not clojure.string/blank?) (line-seq r)))
         :get-body (partial parse-body file)}
        (assoc-pretty-date))))
