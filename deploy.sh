lein export
cp resources/keybase.txt dist/keybase.txt
rsync -zvr --delete dist/ augustl.com:www/augustl.com/
