lein build-site
rsync -zvr --delete dist/ augustl.com:www/augustl.com/
