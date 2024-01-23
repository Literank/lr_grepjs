.PHONY: run test lint build publish clean

run:
	npm start

test:
	npm test

lint:
	npm run lint

install:
	npm install -g

build:
	npm run build

publish: build
	npm publish

clean:
	rm -rf dist