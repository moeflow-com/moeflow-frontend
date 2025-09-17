import fsp from 'node:fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const assetDir = path.join(__dirname, '../src/locales');
const messageYaml = path.join(assetDir, 'messages.yaml');

/**
 * yield [path, message] pairs
 */
function* extractPathedMessages(obj: object, locale: string, pathPrefix: readonly string[] = []): Generator<[string, string]> {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value) {
      yield* extractPathedMessages(value, locale, [...pathPrefix, key]);
    } else if (typeof value === 'string' && key === locale) {
      yield [pathPrefix.join('.'), value];
    }
  }
}

const lang2Basename = Object.entries({
    zhCn: 'zh-cn.json',
    en: 'en.json',
})

setTimeout(async function main() {
  /**
   * key => locale => message
   * */
  const messages = yaml.load(
    await fsp.readFile(messageYaml, { encoding: 'utf-8' }),
  ) as Record<string, Record<string, string>>;

  const path2count: Record<string, number> = {};
  for (const [locale, basename] of lang2Basename ) {
    /**
     * key => message
     */
    const value: Record<string, string> = {};
    for(const [path, msg] of extractPathedMessages(messages, locale)) {
      path2count[path] = (path2count[path] ?? 0) + 1;
      value[path] = msg;
    }
    const dest = path.join(assetDir, basename);
    await fsp.writeFile(dest, JSON.stringify(value, null, 2));
    console.info(`written to ${dest}`);
  }
});
