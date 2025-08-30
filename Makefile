locale-json: src/locales/en.json src/locales/zh-cn.json

locale-json-watch:
	watch make locale-json

format:
	npm run format:fix

src/locales/en.json: src/locales/messages.yaml
	node_modules/.bin/tsx scripts/generate-locale-json.ts

src/locales/zh-cn.json: src/locales/messages.yaml
	node_modules/.bin/tsx scripts/generate-locale-json.ts

