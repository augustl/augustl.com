(defproject augustl-com "0.1.0-SNAPSHOT"
  :description "augustl.com source code"
  :url "http://augustl.com"
  :license {:name "BSD 2 Clause"
            :url "http://opensource.org/licenses/BSD-2-Clause"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [stasis "1.0.0"]
                 [ring "1.2.1"]
                 [ring/ring-jetty-adapter "1.2.1"]
                 [joda-time "2.3"]
                 [hiccup "1.0.5"]]
  :aliases {"build-site" ["run" "-m" "augustl-com.web/export" "dist"]
            "server" ["run" "-m" "augustl-com.dev-server/run" "4567"]})
