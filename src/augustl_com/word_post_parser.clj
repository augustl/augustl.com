(ns augustl-com.word-post-parser
  (:require [clojure.java.io :as io]
            [clojure.string :as s]
            [hiccup.core :as hiccup])
  (:import (java.io File)
           (java.nio.file Paths)
           (org.joda.time LocalDate)
           (org.joda.time.format DateTimeFormat)
           (org.apache.poi.xwpf.usermodel XWPFDocument XWPFHyperlink XWPFHyperlinkRun XWPFParagraph XWPFRun)))

(def date-formatter (DateTimeFormat/forPattern "yyyy.MM.dd"))
(def pretty-date-formatter (DateTimeFormat/forPattern "MMMM dd, yyyy"))

(def header-line-re #"^(.*): (.*)$")

(defn runs-to-hiccup-seq [runs ^XWPFDocument doc]
  (for [^XWPFRun run runs]
    (if (instance? XWPFHyperlinkRun run)
      (let [^XWPFHyperlink hyperlink (.getHyperlink ^XWPFHyperlinkRun run doc)]
        [:a {:href (.getURL hyperlink)} (hiccup/h (.text run))])
      (let [style (cond-> []
                          (.isBold run) (conj "font-weight: bold")
                          (.isItalic run) (conj "font-style: italic")
                          (.isStrikeThrough run) (conj "text-decoration: line-through"))
            tag (when (= "CodeInline" (.getStyle run)) :code)]
        (if (seq style)
          [(or tag :span) {:style (s/join "; " style)} (hiccup/h (.text run))]
          (if tag
            [tag (hiccup/h (.text run))]
            (hiccup/h (.text run))))))))

(defn get-next-hiccup-paragraph [paragraphs]
  (let [[text-paragraphs rest] (->> paragraphs
                                    (split-with
                                      #(and (not= % ::blank)
                                            (nil? (::style %)))))]
    [(into [:p]
           (->> text-paragraphs
                (map #(runs-to-hiccup-seq (::runs %) (::doc %)))
                (interpose [:br])))
     rest]))

(defn get-code-block-tag [code-paras]
  [:pre
   [:code
    (->> code-paras
         (map #(if (= ::blank %) "" (hiccup/h (.getText (::para %)))))
         (s/join \newline))]])

(defn consume-paragraph-chunk [pred xs]
  (let [[chunk rest] (split-with #(or (pred %) (= ::blank %)) xs)
        whitespace-tail (->> chunk (reverse) (take-while #(= ::blank %)))]
    [(->> chunk
          (drop-last (count whitespace-tail)))
     (concat whitespace-tail rest)]))

(defn get-next-hiccup-tag [paragraphs]
  (let [paragraphs (->> paragraphs
                        (drop-while #(= % ::blank)))
        {style ::style runs ::runs doc ::doc} (first paragraphs)]
    (case style
      "Code" (let [[code-paras rest] (->> paragraphs
                                          (consume-paragraph-chunk #(= "Code" (::style %))))]
               [(get-code-block-tag code-paras) rest])
      "Heading2" [(into [:h2] (runs-to-hiccup-seq runs doc)) (rest paragraphs)]
      "Heading3" [(into [:h3] (runs-to-hiccup-seq runs doc)) (rest paragraphs)]
      "Heading4" [(into [:h4] (runs-to-hiccup-seq runs doc)) (rest paragraphs)]
      (get-next-hiccup-paragraph paragraphs))))

(defn word-paragraphs-hiccup-seq [paragraphs]
  (lazy-seq
    (when (seq paragraphs)
      (let [[curr-paragraph rest-paragraphs] (get-next-hiccup-tag paragraphs)]
        (if curr-paragraph
          (cons curr-paragraph (word-paragraphs-hiccup-seq rest-paragraphs))
          (word-paragraphs-hiccup-seq rest-paragraphs))))))

(defn get-headers-from-docx [^File file]
  (with-open [doc (XWPFDocument. (io/input-stream file))]
    (->
      (reduce
        (fn [res ^XWPFParagraph paragraph]
          (let [text (.getParagraphText paragraph)]
            (if-let [[_ key value] (re-find header-line-re text)]
              (assoc res (keyword key) value)
              (reduced res))))
        {}
        (iterator-seq (.getParagraphsIterator doc)))
      (update :date #(when % (LocalDate/parse % date-formatter))))))

(defn get-body-from-docx [^File file]
  (with-open [doc (XWPFDocument. (io/input-stream file))]
    (->> (iterator-seq (.getParagraphsIterator doc))
         (drop-while #(re-find header-line-re (.getText %)))
         (map (fn [para]
                (if-let [runs (seq (.getRuns para))]
                  {::runs runs
                   ::style (.getStyleID para)
                   ::para para
                   ::doc doc}
                  ::blank)))
         (word-paragraphs-hiccup-seq))))

(defn parse [^File dir ^File file]
  (when (not (re-find #"^~" (.getName file)))
    (let [relative-path (-> (subs (.getPath file) (count (.getPath dir)))
                            (s/replace #"\..*$" ""))
          path-segments (->> (Paths/get relative-path (make-array String 0))
                             (.iterator)
                             (iterator-seq)
                             (map #(.toString %)))
          url (str "/" (s/join "/" path-segments))
          headers (get-headers-from-docx file)]
      {:headers headers
       :url url
       :get-body #(get-body-from-docx file)
       :id (clojure.string/replace url #"/" ":")
       :pretty-date (.print pretty-date-formatter (:date headers))})))
