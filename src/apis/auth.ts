/**
 * 注册/登陆等帐号相关 API
 */
import { request } from '.';
import { toUnderScoreCase } from '@/utils';
import { AxiosRequestConfig } from 'axios';

/** 获取验证码 */
const getCAPTCHA = ({ configs }: { configs?: AxiosRequestConfig } = {}) => {
  return request({
    method: 'POST',
    url: `/v1/captchas`,
    ...configs,
  });
};

/** 获取验证邮件请求的请求数据 */
interface GetConfirmEmailVCodeData {
  email: string;
  captcha: string;
  captchaInfo: string;
}
/** 获取验证邮件 */
const getConfirmEmailVCode = ({
  data,
  configs,
}: {
  data: GetConfirmEmailVCodeData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/confirm-email-codes`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 获取验证邮件请求的请求数据 */
interface GetResetPasswordVCodeData {
  email: string;
  captcha: string;
  captchaInfo: string;
}
/** 获取验证邮件 */
const getResetPasswordVCode = ({
  data,
  configs,
}: {
  data: GetResetPasswordVCodeData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/reset-password-codes`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 获取验证邮件 */
const getResetEmailVCode = ({
  configs,
}: {
  configs?: AxiosRequestConfig;
} = {}) => {
  return request({
    method: 'POST',
    url: `/v1/reset-email-codes`,
    ...configs,
  });
};

/** 注册的请求数据 */
interface RegisterData {
  email: string;
  vCode: string;
  name: string;
  password: string;
}
/** 注册 */
const register = ({
  data,
  configs,
}: {
  data: RegisterData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'POST',
    url: `/v1/users`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 登陆的请求数据 */
interface ResetPasswordData {
  email: string;
  password: string;
  vCode: string;
}
/** 获取验证邮件 */
const resetPassword = ({
  data,
  configs,
}: {
  data: ResetPasswordData;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'DELETE',
    url: `/v1/user/password`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 登陆的请求数据 */
interface LoginData {
  email: string;
  password: string;
  captcha: string;
  captchaInfo: string;
}
/** 获取验证邮件 */
const login = ({
  data,
  configs,
}: {
  data: LoginData;
  configs?: AxiosRequestConfig;
}) => {
  return request<{ token: string }>({
    method: 'POST',
    url: `/v1/user/token`,
    data: toUnderScoreCase(data),
    ...configs,
  });
};

/** 获取用户信息的请求数据 */
interface GetUserInfoData {
  token: string;
}

export interface GetUserInfoResponse {
  id: string;
  name: string;
  signature?: string;
  avatar?: string;
  has_avatar: boolean;
  // local
  admin?: boolean;
}
/** 获取用户信息 */
const getUserInfo = ({
  data,
  configs,
}: {
  data?: GetUserInfoData;
  configs?: AxiosRequestConfig;
}) => {
  return request<GetUserInfoResponse>({
    method: 'GET',
    url: `/v1/user/info`,
    ...configs,
  });
};

export default {
  getCAPTCHA,
  getConfirmEmailVCode,
  getResetPasswordVCode,
  getResetEmailVCode,
  resetPassword,
  register,
  login,
  getUserInfo,
};
