(defproject augustl-com "0.1.0-SNAPSHOT"
  :description "augustl.com source code"
  :url "http://augustl.com"
  :license {:name "BSD 2 Clause"
            :url "http://opensource.org/licenses/BSD-2-Clause"}
  :dependencies [[org.clojure/clojure "1.11.1"]
                 [stasis "2.5.1"]
                 [ring "1.9.5"]
                 [ring/ring-jetty-adapter "1.9.5"]
                 [joda-time "2.10.14"]
                 [hiccup "1.0.5"]
                 [optimus "1.0.0-rc2"]
                 [nrepl "0.9.0"]
                 [org.clojure/tools.nrepl "0.2.13"]
                 [augusts-fancy-blog-post-parser "0.2.0"]
                 [com.vladsch.flexmark/flexmark-all "0.50.42"]
                 [org.apache.poi/poi "5.2.3"]
                 [org.apache.poi/poi-ooxml "5.2.3"]]
  :aliases {"export" ["run" "-m" "augustl-com.cli/export" "dist"]}
  :profiles
  {:dev {:source-paths ["dev"]
         :dependencies []}})
