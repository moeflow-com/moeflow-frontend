import { AxiosRequestConfig } from 'axios';
import { request } from '.';
import { toUnderScoreCase } from '@/utils';
import { APISource } from './source';
import { APITarget } from './target';
import { APIUser } from './user';

export interface APITranslation {
  sourceID: string;
  id: string;
  mt: boolean;
  content: string;
  user: APIUser | null;
  proofreadContent: string;
  proofreader: APIUser | null;
  selected: boolean;
  selector: APIUser | null;
  createTime: string;
  editTime: string;
  target: APITarget;
}

/** 新增翻译的请求数据 */
export interface CreateTranslationData {
  content: string;
  targetID: string;
}
/** 新增翻译 */
const createTranslation = ({
  sourceID,
  data,
  configs,
}: {
  sourceID: string;
  data: CreateTranslationData;
  configs?: AxiosRequestConfig;
}) => {
  return request<APITranslation>({
    method: 'POST',
    url: `/v1/sources/${sourceID}/translations`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 修改翻译的请求数据 */
export interface EditTranslationData {
  content?: string;
  proofreadContent?: string;
  selected?: boolean;
}
/** 修改翻译 */
const editTranslation = ({
  translationID,
  data,
  configs,
}: {
  translationID: string;
  data: EditTranslationData;
  configs?: AxiosRequestConfig;
}) => {
  return request<APITranslation>({
    method: 'PUT',
    url: `/v1/translations/${translationID}`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 批量选择翻译的请求数据 */
export type BatchSelectTranslationData = {
  sourceID: string;
  translationID: string;
}[];
/** 批量选择翻译 */
const batchSelectTranslation = ({
  fileID,
  data,
  configs,
}: {
  fileID: string;
  data: BatchSelectTranslationData;
  configs?: AxiosRequestConfig;
}) => {
  return request<APISource[]>({
    method: 'PATCH',
    url: `/v1/files/${fileID}/sources`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 删除翻译 */
const deleteTranslation = ({
  translationID,
  configs,
}: {
  translationID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request<APITranslation>({
    method: 'DELETE',
    url: `/v1/translations/${translationID}`,
    ...configs,
  });
};

export default {
  createTranslation,
  deleteTranslation,
  editTranslation,
  batchSelectTranslation,
};
