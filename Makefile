build: install
	@npm run build

serve: install
	@npm start

install:
	@npm install

clean:
	@rm -f public/app.js

lint:
	@npm run lint

test:
	@npm test

.PHONY: build serve install clean lint test
