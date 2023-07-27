/**
 * 项目相关 API
 */
import { AxiosRequestConfig } from 'axios';
import { PaginationParams, request } from '.';
import {
  IMPORT_FROM_LABELPLUS_ERROR_TYPE,
  IMPORT_FROM_LABELPLUS_STATUS,
  PROJECT_STATUS,
} from '../constants';
import { Language, Project, ProjectSet, Role, Team } from '../interfaces';
import { toUnderScoreCase } from '../utils';

export interface APIProject {
  groupType: 'project';
  id: string;
  name: string;
  intro: string;
  hasAvatar: boolean;
  avatar: string;
  allowApplyType: number;
  isNeedCheckApplication: boolean;
  maxUser: number;
  userCount: number;
  status: number;
  createTime: string;
  editTime: string;
  role: Role;
  autoBecomeProjectAdmin: boolean;
  sourceLanguage: Language;
  targetCount: number;
  sourceCount: number;
  translatedSourceCount: number;
  checkedSourceCount: number;
  team: Team;
  projectSet: ProjectSet;
  importFromLabelplusStatus: IMPORT_FROM_LABELPLUS_STATUS;
  importFromLabelplusPercent: number;
  importFromLabelplusErrorType: IMPORT_FROM_LABELPLUS_ERROR_TYPE;
  importFromLabelplusErrorTypeName: string;
}

/** 获取团队的项目列表的请求数据 */
interface GetTeamProjectsParams {
  word?: string;
  status?: PROJECT_STATUS;
}
/** 获取团队的项目列表 */
const getTeamProjects = ({
  teamID,
  projectSetID,
  params,
  configs,
}: {
  teamID: string;
  projectSetID: string;
  params?: GetTeamProjectsParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request<Project[]>({
    method: 'GET',
    url: `/v1/teams/${teamID}/projects`,
    params: { project_set: projectSetID, ...toUnderScoreCase(params) },
    ...configs,
  });
};

/** 获取用户的项目列表的请求数据 */
interface GetUserProjectsParams {
  word?: string;
  status?: PROJECT_STATUS;
}
/** 获取用户的项目列表 */
const getUserProjects = ({
  params,
  configs,
}: {
  params?: GetUserProjectsParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request<Project[]>({
    method: 'GET',
    url: `/v1/user/projects`,
    params: { ...toUnderScoreCase(params) },
    ...configs,
  });
};

/** 获取项目 */
const getProject = ({
  id,
  configs,
}: {
  id: string;
  configs?: AxiosRequestConfig;
}) => {
  return request<Project>({
    method: 'GET',
    url: `/v1/projects/${id}`,
    ...configs,
  });
};

/** 新建项目的请求数据 */
interface CreateProjectData {
  name: string;
  intro: string;
  allowApplyType: number;
  applicationCheckType: number;
  defaultRole: string;
  labelplusTxt?: string;
}
/** 新建项目 */
const createProject = ({
  teamID,
  data,
  configs,
}: {
  teamID: string;
  data: CreateProjectData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/teams/${teamID}/projects`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 导入项目的请求数据 */
interface ImportProjectData {
  project: Blob;
  labelplus: Blob;
}
/** 导入项目 */
const importProject = ({
  teamID,
  projectSetID,
  data,
  configs,
}: {
  teamID: string;
  projectSetID: string;
  data: ImportProjectData;
  configs?: AxiosRequestConfig;
}) => {
  var formData = new FormData();
  formData.append('project', new File([data.project], 'project'));
  formData.append('labelplus', new File([data.labelplus], 'labelplus'));

  return request({
    method: 'POST',
    url: `/v1/teams/${teamID}/project-sets/${projectSetID}/project-zips`,
    data: formData,
    ...{
      ...configs,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  });
};

/** 上传文件 */
const uploadFile = ({
  projectID,
  filename,
  file,
  configs,
}: {
  projectID: string;
  filename: string;
  file: Blob;
  configs?: AxiosRequestConfig;
}) => {
  var formData = new FormData();
  formData.append('file', new File([file], filename));

  return request({
    method: 'POST',
    url: `/v1/projects/${projectID}/files`,
    data: formData,
    ...{
      ...configs,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
    ...configs,
  });
};

/** 修改项目的请求数据 */
interface EditProjectData {
  name: string;
  intro: string;
  allowApplyType: number;
  applicationCheckType: number;
  defaultRole: string;
}
/** 修改项目 */
const editProject = ({
  id,
  data,
  configs,
}: {
  id: string;
  data: EditProjectData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'PUT',
    url: `/v1/projects/${id}`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 完结项目 */
const finishProject = ({
  id,
  configs,
}: {
  id: string;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'DELETE',
    url: `/v1/projects/${id}`,
    ...configs,
  });
};

const startProjectOCR = ({
  id,
  configs,
}: {
  id: string;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/projects/${id}/ocr`,
    ...configs,
  });
};

export default {
  getUserProjects,
  getTeamProjects,
  getProject,
  createProject,
  editProject,
  finishProject,
  startProjectOCR,
  importProject,
  uploadFile,
};
