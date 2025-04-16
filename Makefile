.DEFAULT_GOAL := all
.PHONY: build
.PHONY: upload

build:
	lein export

upload:
	vercel --prod

all: build upload