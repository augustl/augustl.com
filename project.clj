(defproject augustl-com "0.1.0-SNAPSHOT"
  :description "augustl.com source code"
  :url "http://augustl.com"
  :license {:name "BSD 2 Clause"
            :url "http://opensource.org/licenses/BSD-2-Clause"}
  :dependencies [[org.clojure/clojure "1.9.0"]
                 [stasis "2.3.0"]
                 [ring "1.7.0"]
                 [ring/ring-jetty-adapter "1.7.0"]
                 [joda-time "2.10"]
                 [hiccup "1.0.5"]
                 [optimus "0.20.1"]
                 [org.clojure/tools.nrepl "0.2.13"]
                 [augusts-fancy-blog-post-parser "0.1.0"]
                 [com.stuartsierra/component "0.3.2"]
                 [org.pegdown/pegdown "1.6.0"]]
  :aliases {"export" ["run" "-m" "augustl-com.cli/export" "dist"]}
  :profiles
  {:dev {:source-paths ["dev"]
         :dependencies [[reloaded.repl "0.2.4"]]}})
