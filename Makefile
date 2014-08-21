build:
	@npm build

serve:
	@npm start

clean:
	@rm -f public/app.js

lint:
	@npm run lint

.PHONY: build serve clean
