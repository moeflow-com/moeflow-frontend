import store from 'store';
import { HotKeyOption } from '../components/HotKey/interfaces';
import { HotKeyState } from '../store/hotKey/slice';
import { LLMConf } from '@/services/ai/llm_preprocess';

interface DefaultTarget {
  projectID: string;
  targetID: string;
}

export const saveDefaultTargetID = ({
  projectID,
  targetID,
}: DefaultTarget): void => {
  let defaultTargets: DefaultTarget[] = store.get('defaultTargets', []);
  defaultTargets = defaultTargets.filter(
    (item) => item.projectID !== projectID,
  );
  defaultTargets.push({ projectID, targetID });
  store.set('defaultTargets', defaultTargets.slice(-50));
};

export const loadDefaultTargetID = ({
  projectID,
}: {
  projectID: string;
}): string | undefined => {
  const defaultTargets: DefaultTarget[] = store.get('defaultTargets', []);
  const defaultTarget = defaultTargets.find(
    (item) => item.projectID === projectID,
  );
  return defaultTarget?.targetID;
};

export const clearDefaultTargetID = ({
  projectID,
}: {
  projectID: string;
}): void => {
  const defaultTargets: DefaultTarget[] = store.get('defaultTargets', []);
  store.set(
    'defaultTargets',
    defaultTargets.filter((item) => item.projectID !== projectID),
  );
};

export const hotKeyStoragePrefix = 'hotKey-';
export type HotKeyStroage = HotKeyOption | null | 'disabled';
export const saveHotKey = ({
  name,
  index,
  option,
}: {
  name: keyof HotKeyState;
  index: number;
  option?: HotKeyOption;
}): void => {
  const options: HotKeyStroage[] = store.get(
    `${hotKeyStoragePrefix}${name}`,
    [],
  );
  options[index] = option ? option : 'disabled';
  store.set(`${hotKeyStoragePrefix}${name}`, options);
};

export const loadHotKey = ({
  name,
  index,
}: {
  name: keyof HotKeyState;
  index: number;
}): HotKeyStroage => {
  const options: HotKeyStroage[] = store.get(
    `${hotKeyStoragePrefix}${name}`,
    [],
  );
  return options[index] ? options[index] : null;
};

export const llmConfStorage = {
  load(): LLMConf | null {
    return store.get('llmConf', null);
  },
  save(conf: LLMConf | null) {
    if (conf) {
      store.set('llmConf', conf);
    } else {
      store.remove('llmConf');
    }
  },
} as const;
