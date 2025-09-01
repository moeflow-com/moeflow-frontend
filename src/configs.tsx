import { lazyThenable } from '@jokester/ts-commonutil/lib/concurrency/lazy-thenable';

export interface RuntimeConfig {
  // base URL for API requests
  baseURL: string;

  // TODO: more fields can be added here
}

/**
 * overridable runtime config
 * priority DESC:
 * 1. /moeflow-runtime-config.json
 * 2. value from vite config
 * 3. fallback
 */
export const runtimeConfig = lazyThenable<RuntimeConfig>(async () => {
  const overriden: RuntimeConfig = await fetch('/moeflow-runtime-config.json')
    .then((res) => res.json())
    .catch(() => null);
  const merged: RuntimeConfig = {
    ...{
      // defaults
      baseURL: process.env.REACT_APP_BASE_URL || '/api/',
    },
    ...overriden,
  };

  // console.debug('runtimeConfig', merged);
  return merged;
});

/** consts */
export const configs = {
  default: {
    team: {
      systemRole: 'member', // 团队默认角色，后端部署后不会变动
      allowApplyType: 2,
      applicationCheckType: 2,
    },
    project: {
      systemRole: 'supporter', // 项目默认角色，后端部署后不会变动
      allowApplyType: 3,
      applicationCheckType: 1,
      sourceLanugageCode: 'ja', // 默认源语言，后端部署后不会变动
      targetLanguageCodes: ['zh-TW'], // 默认目标语言，后端部署后不会变动
    },
  },
} as const;

if (process.env.NODE_ENV === 'production') {
  // 生产环境配置
} else if (process.env.NODE_ENV === 'test') {
  // 测试环境配置
} else if (process.env.NODE_ENV === 'development') {
  // dev
  console.debug({
    configs,
    env: process.env.NODE_ENV,
  });
} else {
  throw new Error(`unexpected environment: ${process.env.NODE_ENV}`);
}
