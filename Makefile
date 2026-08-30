.DEFAULT_GOAL := build
.PHONY: build deploy upload

build:
	yarn build

upload:
	vercel --prod

deploy: build upload
