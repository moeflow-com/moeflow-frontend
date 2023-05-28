/**
 * 角色相关 API
 */
import { AxiosRequestConfig } from 'axios';
import { PaginationParams, request } from '.';
import { toUnderScoreCase } from '../utils';

export interface APIUser {
  id: string;
  name: string;
  signature: string;
  avatar: string;
  hasAvatar: boolean;
  admin: boolean;
  locale: {
    id: string;
    name: string;
    intro: string;
  };
}

export interface APIVCode {
  id: string;
  content: string;
  intro: string;
  info: string;
  expires: string;
  wrong_count: string;
  send_time: string;
}

/** 获取用户列表的请求数据 */
interface GetUsersParams {
  word: string;
}
/** 获取用户列表 */
const getUsers = ({
  params,
  configs,
}: {
  params?: GetUsersParams & PaginationParams;
  configs?: AxiosRequestConfig;
} = {}) => {
  return request<APIUser[]>({
    method: 'GET',
    url: `/v1/users`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

/** 修改用户信息的请求数据 */
interface EditUserData {
  name: string;
  signature: string;
}
/** 修改用户信息 */
const editUser = ({
  data,
  configs,
}: {
  data: EditUserData;
  configs?: AxiosRequestConfig;
}) => {
  return request<{ message: string; user: APIUser }>({
    method: 'PUT',
    url: `/v1/user/info`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 修改用户密码的请求数据 */
interface EditUserPasswordData {
  oldPassword: string;
  newPassword: string;
}
/** 修改用户密码 */
const editUserPassword = ({
  data,
  configs,
}: {
  data: EditUserPasswordData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'PUT',
    url: `/v1/user/password`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 修改用户邮箱的请求数据 */
interface EditUserEmailData {
  oldEmailVCode: string;
  newEmail: string;
  newEmailVCode: string;
}
/** 修改用户邮箱 */
const editUserEmail = ({
  data,
  configs,
}: {
  data: EditUserEmailData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'PUT',
    url: `/v1/user/email`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 管理员获取用户列表的请求数据 */
interface AdminGetUsersParams {
  word: string;
}
/** 管理员获取用户列表 */
const adminGetUserList = ({
  params,
  configs,
}: {
  params?: AdminGetUsersParams & PaginationParams;
  configs?: AxiosRequestConfig;
} = {}) => {
  return request<APIUser[]>({
    method: 'GET',
    url: `/v1/admin/users`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

interface AdminChangeAdminStatusData {
  userId: string;
  status: boolean;
}
const adminChangeAdminStatus = ({
  data,
  configs,
}: {
  data: AdminChangeAdminStatusData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'PUT',
    url: `/v1/admin/admin-status`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

interface AdminCreateUserData {
  email: string;
  name: string;
  password: string;
}
/** 管理后台新建用户 */
const adminCreateUser = ({
  data,
  configs,
}: {
  data: AdminCreateUserData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/admin/users`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

interface AdminEditUserPasswordData {
  password: string;
}
/** 修改用户密码 */
const adminEditUserPassword = ({
  userID,
  data,
  configs,
}: {
  userID: string;
  data: AdminEditUserPasswordData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'PUT',
    url: `/v1/admin/users/${userID}`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 管理员获取验证码列表 */
const adminGetVCodeList = ({
  configs,
}: {
  configs?: AxiosRequestConfig;
} = {}) => {
  return request<APIVCode[]>({
    method: 'GET',
    url: `/v1/admin/v-codes`,
    ...configs,
  });
};

export default {
  getUsers,
  editUser,
  editUserPassword,
  editUserEmail,
  adminGetUserList,
  adminChangeAdminStatus,
  adminCreateUser,
  adminEditUserPassword,
  adminGetVCodeList,
};
