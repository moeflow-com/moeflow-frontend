import { AxiosRequestConfig } from 'axios';
import { request, PaginationParams } from '.';
import { GroupTypes } from './type';
import { toPlural, toUnderScoreCase } from '../utils';
import { Role } from '../interfaces';

/** 获取团队用户列表的请求数据 */
interface GetMembersParams {
  word: string;
}
/** 获取团队用户列表 */
const getMembers = ({
  groupType,
  groupID,
  params,
  configs,
}: {
  groupType: GroupTypes;
  groupID: string;
  params: GetMembersParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'GET',
    url: `/v1/${toPlural(groupType)}/${groupID}/users`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

/** 删除团队成员 */
const deleteMember = ({
  groupType,
  groupID,
  userID,
  configs,
}: {
  groupType: GroupTypes;
  groupID: string;
  userID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'DELETE',
    url: `/v1/${toPlural(groupType)}/${groupID}/users/${userID}`,
    ...configs,
  });
};

/** 修改团队成员的请求数据 */
interface EditMemberData {
  roleID: string;
}
interface EditMemberReturn {
  message: string;
  role: Role;
}
/** 修改团队成员 */
const editMember = ({
  groupType,
  groupID,
  userID,
  data,
  configs,
}: {
  groupType: GroupTypes;
  groupID: string;
  userID: string;
  data: EditMemberData;
  configs?: AxiosRequestConfig;
}) => {
  return request<EditMemberReturn>({
    method: 'PUT',
    url: `/v1/${toPlural(groupType)}/${groupID}/users/${userID}`,
    data: {
      role: data.roleID,
    },
    ...configs,
  });
};

export default {
  getMembers,
  deleteMember,
  editMember,
};
