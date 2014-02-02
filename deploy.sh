bundle exec middleman build
rsync -zvr --delete build/ augustl.com:www/augustl.com/
