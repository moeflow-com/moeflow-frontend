/**
 * 角色相关 API
 */
import { AxiosRequestConfig } from 'axios';
import { PaginationParams, request } from '.';
import { ApplicationStatuses } from '../constants/application';
import { InvitationStatuses } from '../constants/invitation';
import { toUnderScoreCase } from '../utils';
import { APIApplication } from './application';
import { APIInvitation } from './invitation';

/** 获取用户的邀请的请求数据 */
interface GetUserInvitationsParams {
  status?: InvitationStatuses[];
}
/** 获取用户的邀请 */
const getUserInvitations = ({
  params,
  configs,
}: {
  params?: GetUserInvitationsParams & PaginationParams;
  configs?: AxiosRequestConfig;
} = {}) => {
  return request<APIInvitation[]>({
    method: 'GET',
    url: `/v1/user/invitations`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

/** 获取用户可以处理的加入申请的请求数据 */
interface GetRelatedApplicationsParams {
  status?: ApplicationStatuses[];
}
/** 获取用户可以处理的加入申请 */
const getRelatedApplications = ({
  params,
  configs,
}: {
  params?: GetRelatedApplicationsParams & PaginationParams;
  configs?: AxiosRequestConfig;
} = {}) => {
  return request<APIApplication[]>({
    method: 'GET',
    url: `/v1/user/related-applications`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

export default {
  getUserInvitations,
  getRelatedApplications,
};
