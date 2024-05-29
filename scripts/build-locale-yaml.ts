import fsp from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const messageYaml = path.join(__dirname, '../src/locales/messages.yaml');

setTimeout(async function () {
  const zhCn = require('../src/locales/zh-cn.json');
  const en = require('../src/locales/en-us.json');

  /** key => locale => string */
  const messages: Record<string, any> = {};

  for (const [locale, values] of Object.entries({ zhCn, en })) {
    for (const [k, v] of Object.entries(values)) {
      if (typeof v !== 'string') {
        throw new Error(`unexpected: ${k} / ${v}`);
      }
      /* locale => string */
      const m: Record<string, string> = (messages[k] ??= {});
      m[locale] = v;
    }
  }

  await fsp.writeFile(messageYaml, yaml.dump(messages, { indent: 2 }));
});
