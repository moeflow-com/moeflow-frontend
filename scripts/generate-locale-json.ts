import fsp from 'node:fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const assetDir = path.join(__dirname, '../src/locales');
const messageYaml = path.join(assetDir, 'messages.yaml');

setTimeout(async function main() {
  /**
   * key => locale => message
   * */
  const messages = yaml.load(
    await fsp.readFile(messageYaml, { encoding: 'utf-8' }),
  ) as Record<string, Record<string, string>>;

  for (const [locale, basename] of Object.entries({
    zhCn: 'zh-cn.json',
    en: 'en.json',
  })) {
    /**
     * key => message
     */
    const value: Record<string, string> = {};
    Object.keys(messages).forEach((messageKey) => {
      const msg = (value[messageKey] = messages[messageKey][locale]);
      if (!msg) {
        throw new Error(
          `translated message not found for key=${messageKey} / locale=${locale}`,
        );
      }
    });
    const dest = path.join(assetDir, basename);
    await fsp.writeFile(dest, JSON.stringify(value, null, 2));
    console.info(`written to ${dest}`);
  }
});
