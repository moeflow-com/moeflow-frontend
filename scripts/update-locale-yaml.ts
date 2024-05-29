import fsp from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const messageYaml = path.join(__dirname, '../src/locales/messages.yaml');

setTimeout(async function main() {
  const messages = yaml.load(
    await fsp.readFile(messageYaml, { encoding: 'utf-8' }),
  ) as Record<string, Record<string, string>>;

  const locales = new Set<string>();

  for (const [k, msgs] of Object.entries(messages)) {
    Object.keys(msgs).forEach((l) => locales.add(l));
  }
  for (const [k, msgs] of Object.entries(messages)) {
    for (const l of locales) {
      msgs[l] ??= 'TODO'; // TODO: machine translation
    }
  }
  await fsp.writeFile(messageYaml, yaml.dump(messages, { indent: 2 }));
});
