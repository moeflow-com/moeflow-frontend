import { AxiosRequestConfig } from 'axios';
import { request } from '.';
import { OUTPUT_STATUS, OUTPUT_TYPE } from '../constants/output';
import { toUnderScoreCase } from '../utils';
import { APIProject } from './project';
import { APITarget } from './target';
import { APIUser } from './user';

export interface APIOutput {
  id: string;
  project: APIProject;
  target: APITarget;
  user?: APIUser;
  type: OUTPUT_TYPE;
  status: OUTPUT_STATUS;
  fileIDsInclude: string[];
  fileIDsExclude: string[];
  statusDetails: {
    id: OUTPUT_STATUS;
    name: string;
    intro: string;
  }[];
  link?: string;
  createTime: string;
}

/** 获取导出 */
const getOutputs = ({
  projectID,
  targetID,
  configs,
}: {
  projectID: string;
  targetID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request<APIOutput[]>({
    method: 'GET',
    url: `/v1/projects/${projectID}/targets/${targetID}/outputs`,
    ...configs,
  });
};

/** 新增导出 */
export interface CreateOutputData {
  type: OUTPUT_TYPE;
  fileIdsInclude?: string[];
  fileIdsExclude?: string[];
}
const createOutput = ({
  projectID,
  targetID,
  data,
  configs,
}: {
  projectID: string;
  targetID: string;
  data: CreateOutputData;
  configs?: AxiosRequestConfig;
}) => {
  return request<APIOutput>({
    method: 'POST',
    url: `/v1/projects/${projectID}/targets/${targetID}/outputs`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

const createAllOutput = ({
  projectID,
  configs,
}: {
  projectID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request<APIOutput[]>({
    method: 'POST',
    url: `/v1/projects/${projectID}/outputs`,
    ...configs,
  });
};

const createTeamOutput = ({
  teamID,
  configs,
}: {
  teamID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request<APIOutput[]>({
    method: 'POST',
    url: `/v1/teams/${teamID}/outputs`,
    ...configs,
  });
};

export default {
  getOutputs,
  createOutput,
  createAllOutput,
  createTeamOutput,
};
