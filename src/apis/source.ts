import { AxiosRequestConfig } from 'axios';
import { PaginationParams, request } from '.';
import { toUnderScoreCase } from '@/utils';
import { APITip } from './tip';
import { APITranslation } from './translation';

export interface APISource {
  id: string;
  x: number;
  y: number;
  content: string;
  myTranslation?: APITranslation;
  positionType: number;
  translations: APITranslation[]; // 不含我的翻译数据
  hasOtherLanguageTranslation: boolean;
  tips: APITip[];
}

/** 获取原文的请求数据 */
interface GetSourcesParams {
  targetID: string;
}
/** 获取原文 */
const getSources = ({
  fileID,
  params,
  configs,
}: {
  fileID: string;
  params: GetSourcesParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request<APISource[]>({
    method: 'GET',
    url: `/v1/files/${fileID}/sources`,
    params: { ...toUnderScoreCase(params), paging: 'false' },
    ...configs,
  });
};

/** 新增原文的请求数据 */
interface CreateSourceData {
  x: number;
  y: number;
  content?: string;
}
/** 新增原文 */
const createSource = ({
  fileID,
  data,
  configs,
}: {
  fileID: string;
  data: CreateSourceData;
  configs?: AxiosRequestConfig;
}) => {
  return request<APISource>({
    method: 'POST',
    url: `/v1/files/${fileID}/sources`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/**
 * move source identified by {@name sourceID} to its new position identified by {@name nextSourceID}
 */
const rerankSource = ({sourceID, nextSourceID}: {sourceID: string, nextSourceID: string | 'end'}) => request<unknown>({
  method: 'PUT',
  url: `/v1/sources/${sourceID}/rank`,
  data: toUnderScoreCase({ nextSourceID })
})

/** 修改原文的请求数据 */
interface EditSourceData {
  x?: number;
  y?: number;
  content?: string;
  positionType?: number;
}
/** 修改原文 */
const editSource = ({
  sourceID,
  data,
  configs,
}: {
  sourceID: string;
  data: EditSourceData;
  configs?: AxiosRequestConfig;
}) => {
  return request<APISource>({
    method: 'PUT',
    url: `/v1/sources/${sourceID}`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 删除原文 */
const deleteSource = ({
  sourceID,
  configs,
}: {
  sourceID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request<APISource>({
    method: 'DELETE',
    url: `/v1/sources/${sourceID}`,
    ...configs,
  });
};

export default {
  getSources,
  createSource,
  deleteSource,
  editSource,
  rerankSource,
};
