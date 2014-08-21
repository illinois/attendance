build:
	@npm build

serve:
	@npm start

clean:
	@rm -f public/app.js

.PHONY: build serve clean
