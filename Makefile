.DEFAULT_GOAL := all
.PHONY: build
.PHONY: upload
.PHONY: invalidate
.PHONY: invalidate-cdn

invalidate:
	aws --profile augustl cloudfront create-invalidation --distribution-id E1OOI5QPC4QPU --paths "/*"

build:
	lein export

upload:
	aws --profile augustl s3 sync dist/ s3://augustl-com-static-web/ --delete

all: build upload