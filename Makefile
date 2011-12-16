IN := src/boilerplate.js src/error.js src/main.js src/converters/*.js src/headers/*.js
MINIFIER := uglifyjs

all: lib/src.min.js

lib/src.js: $(IN)
	mkdir lib/ -p
	cat src/wrappers/start.js $^ src/wrappers/end.js > $@

%.min.js: %.js
	$(MINIFIER) $^ > $@ 

clean:
	rm lib/ -rf
