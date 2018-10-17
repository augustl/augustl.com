lein export
cp resources/keybase.txt dist/keybase.txt
aws s3 sync dist/ s3://augustl-com-static-web/ --delete