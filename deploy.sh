lein export
cp resources/keybase.txt dist/keybase.txt
aws s3 sync dist/ s3://augustl-com-static-web/ --delete

# aws cloudfront create-invalidation --distribution-id E1OOI5QPC4QPU --paths "/*"