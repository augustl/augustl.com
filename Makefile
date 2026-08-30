.DEFAULT_GOAL := build
.PHONY: build legacy-build deploy upload

build:
	yarn build

legacy-build:
	lein export

upload:
	vercel --prod

deploy: build upload
