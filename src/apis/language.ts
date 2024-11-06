/**
 * 各种类型选项（系统角色/加入审核类型等） API
 */
import { request } from '.';
import { AxiosRequestConfig } from 'axios';
import { getIntl } from '@/locales';
import { toLowerCamelCase } from '@/utils';

export interface APILanguage {
  id: string;
  enName: string;
  loName: string;
  i18nName: string;
  noSpace: boolean;
  code: string;
  gTraCode: string;
  gOcrCode: string;
  sort: number;
}

/** 获取系统角色的请求数据 */
interface GetLanguagesData {
  configs?: AxiosRequestConfig;
}

/** Get global lang list */
async function getLanguages({ configs = {} } = {} as GetLanguagesData) {
  const res = await request<APILanguage[]>({
    method: 'GET',
    url: `/v1/languages`,
    ...configs,
  });
  res.data = res.data.map((item) => toLowerCamelCase(item));
  const intl = getIntl();
  if (intl.locale === 'en') {
    res.data.forEach((item) => {
      // workaround server's corrupted data
      item.i18nName = item.enName;
    });
  }
  return res;
}

export default {
  getLanguages,
};
