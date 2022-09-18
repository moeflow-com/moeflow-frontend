/**
 * 目标相关 API
 */
import { request } from '.';
import { AxiosRequestConfig } from 'axios';
import { toUnderScoreCase } from '../utils';
import { PaginationParams } from '.';
import { APILanguage } from './language';

export interface APITarget {
  id: string;
  language: APILanguage;
  translatedSourceCount: number;
  checkedSourceCount: number;
  createTime: string;
  editTime: string;
  intro: string;
}

/** 获取项目的翻译目标列表的请求数据 */
interface GetProjectTargetsParams {
  word?: string;
}
/** 获取项目的翻译目标列表 */
const getProjectTargets = ({
  projectID,
  params,
  configs,
}: {
  projectID: string;
  params?: GetProjectTargetsParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'GET',
    url: `/v1/projects/${projectID}/targets`,
    params: { ...toUnderScoreCase(params) },
    ...configs,
  });
};

/** 新建翻译目标的请求数据 */
interface CreateTargetData {
  language: string;
}
/** 新建翻译目标 */
const createTarget = ({
  projectID,
  data,
  configs,
}: {
  projectID: string;
  data: CreateTargetData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/projects/${projectID}/targets`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 完结翻译目标 */
const deleteTarget = ({
  id,
  configs,
}: {
  id: string;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'DELETE',
    url: `/v1/targets/${id}`,
    ...configs,
  });
};

export default {
  getProjectTargets,
  createTarget,
  deleteTarget,
};
