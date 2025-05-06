/**
 * 文件相关 API
 */
import { request } from '.';
import { AxiosRequestConfig } from 'axios';
import { toUnderScoreCase } from '@/utils';
import { PaginationParams } from '.';
import { File } from '@/interfaces';
import { FileSafeStatuses } from '@/constants';

/** 获取项目中文件列表的请求数据 */
interface GetProjectFilesParams {
  target?: string;
  word?: string;
}
/** 获取项目中文件列表 */
const getProjectFiles = ({
  projectID,
  params,
  configs,
}: {
  projectID: string;
  params?: GetProjectFilesParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request<File[]>({
    method: 'GET',
    url: `/v1/projects/${projectID}/files`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

/** 获取文件的请求数据 */
interface GetFileParams {
  target?: string;
}
export interface GetFileReturn extends File {
  projectID: string;
}
/** 获取文件 */
const getFile = ({
  fileID,
  params,
  configs,
}: {
  fileID: string;
  params?: GetFileParams;
  configs?: AxiosRequestConfig;
}) => {
  return request<GetFileReturn>({
    method: 'GET',
    url: `/v1/files/${fileID}`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

/** 删除文件 */
const deleteFile = ({
  id,
  configs,
}: {
  id: string;
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'DELETE',
    url: `/v1/files/${id}`,
    ...configs,
  });
};

/** 获取项目中文件列表的请求数据 */
interface AdminGetFilesParams {
  safeStatus?: FileSafeStatuses[];
}
/** 获取项目中文件列表 */
const adminGetFiles = ({
  params,
  configs,
}: {
  params?: AdminGetFilesParams & PaginationParams;
  configs?: AxiosRequestConfig;
}) => {
  return request<File[]>({
    method: 'GET',
    url: `/v1/admin/files`,
    params: toUnderScoreCase(params),
    ...configs,
  });
};

const adminSafeCheck = ({
  safeFileIDs,
  unsafeFileIDs,
  configs,
}: {
  safeFileIDs: string[];
  unsafeFileIDs: string[];
  configs?: AxiosRequestConfig;
}) => {
  return request({
    method: 'PUT',
    url: `/v1/admin/files/safe-status`,
    data: toUnderScoreCase({
      safeFiles: safeFileIDs,
      unsafeFiles: unsafeFileIDs,
    }),
    ...configs,
  });
};

export default {
  getProjectFiles,
  getFile,
  deleteFile,
  adminGetFiles,
  adminSafeCheck,
};
