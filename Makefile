build: install
	@npm build

serve: install
	@npm start

install:
	@npm install

clean:
	@rm -f public/app.js

lint:
	@npm run lint

.PHONY: build serve clean
