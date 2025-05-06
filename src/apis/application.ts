import { GroupTypes } from './type';
import { request, PaginationParams } from '.';
import { toPlural, toUnderScoreCase } from '@/utils';
import { AxiosRequestConfig } from 'axios';
import { APIUser } from './user';
import { Role, UserTeam } from '@/interfaces';
import { APIProject } from './project';
import { ApplicationStatuses } from '@/constants';

export interface APIBaseApplication {
  id: string;
  user: APIUser;
  userRole: Role | null;
  groupRoles: Role[];
  operator: APIUser | null;
  createTime: string;
  status: ApplicationStatuses;
  message: string;
}
export interface APITeamApplication extends APIBaseApplication {
  group: UserTeam;
  groupType: 'team';
}
export interface APIProjectApplication extends APIBaseApplication {
  group: APIProject;
  groupType: 'project';
}
export type APIApplication = APITeamApplication | APIProjectApplication;

/** 获取团体申请列表的请求数据 */
interface GetApplicationsParams {}
/** 获取团体申请列表 */
const getApplications = ({
  groupType,
  groupID,
  params,
  configs,
}: {
  groupType: GroupTypes;
  groupID: string;
  params: GetApplicationsParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request<APIApplication[]>({
    method: 'GET',
    url: `/v1/${toPlural(groupType)}/${groupID}/applications`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

/** 创建申请的请求数据 */
interface CreateApplicationData {
  message: string;
}
/** 创建申请 */
const createApplication = ({
  groupType,
  groupID,
  data,
  configs,
}: {
  groupType: GroupTypes;
  groupID: string;
  data: CreateApplicationData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/${toPlural(groupType)}/${groupID}/applications`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 处理申请的请求数据 */
interface DealApplicationData {
  allow: boolean;
}
interface DealApplicationReturn {
  message: string;
  application: APIApplication;
}
/** 处理申请 */
const dealApplication = ({
  applicationID,
  data,
  configs,
}: {
  applicationID: string;
  data: DealApplicationData;
  configs?: AxiosRequestConfig;
}) => {
  return request<DealApplicationReturn>({
    method: 'PATCH',
    url: `/v1/applications/${applicationID}`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 删除申请 */
const deleteApplication = ({
  applicationID,
  configs,
}: {
  applicationID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'DELETE',
    url: `/v1/applications/${applicationID}`,
    ...configs,
  });
};

export default {
  getApplications,
  createApplication,
  dealApplication,
  deleteApplication,
};
