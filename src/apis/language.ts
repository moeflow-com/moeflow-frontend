/**
 * 各种类型选项（系统角色/加入审核类型等） API
 */
import { request } from '.';
import { AxiosRequestConfig } from 'axios';

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
/** 获取系统角色 */
const getLanguages = ({ configs = {} } = {} as GetLanguagesData) => {
  return request<APILanguage[]>({
    method: 'GET',
    url: `/v1/languages`,
    ...configs,
  });
};

export default {
  getLanguages,
};
