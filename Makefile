locale-json:
	node_modules/.bin/tsx scripts/generate-locale-json.ts

locale-json-watch:
	watch make locale-json

format:
	npm run format:fix

build: .PHONY
	npm run build

.PHONY:
