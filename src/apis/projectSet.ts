/**
 * 角色相关 API
 */
import { request } from '.';
import { AxiosRequestConfig } from 'axios';
import { toUnderScoreCase } from '../utils';
import { PaginationParams } from '.';

/** 获取团队的项目集列表的请求数据 */
interface GetTeamProjectSetsParams {
  word?: string;
}
/** 获取团队的项目集列表 */
const getTeamProjectSets = ({
  teamID,
  params,
  configs,
}: {
  teamID: string;
  params?: GetTeamProjectSetsParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'GET',
    url: `/v1/teams/${teamID}/project-sets`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

/** 获取项目集 */
const getProjectSet = ({
  id,
  configs,
}: {
  id: string;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'GET',
    url: `/v1/project-sets/${id}`,
    ...configs,
  });
};

/** 新建项目集的请求数据 */
interface CreateProjectSetData {
  name: string;
  intro: string;
  allowApplyType: number;
  applicationCheckType: number;
  defaultRole: string;
}
/** 新建项目集 */
const createProjectSet = ({
  teamID,
  data,
  configs,
}: {
  teamID: string;
  data: CreateProjectSetData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/teams/${teamID}/project-sets`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 修改项目集的请求数据 */
interface EditProjectSetData {
  name: string;
  intro: string;
  allowApplyType: number;
  applicationCheckType: number;
  defaultRole: string;
}
/** 修改项目集 */
const editProjectSet = ({
  id,
  data,
  configs,
}: {
  id: string;
  data: EditProjectSetData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'PUT',
    url: `/v1/project-sets/${id}`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 解散项目集 */
const deleteProjectSet = ({
  id,
  configs,
}: {
  id: string;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'DELETE',
    url: `/v1/project-sets/${id}`,
    ...configs,
  });
};

export default {
  getTeamProjectSets,
  getProjectSet,
  createProjectSet,
  editProjectSet,
  deleteProjectSet,
};
