/**
 * 各种类型选项（系统角色/加入审核类型等） API
 */
import { request } from '.';
import { toUnderScoreCase, toHyphenCase } from '@/utils';
import { AxiosRequestConfig } from 'axios';

export type TypeNames =
  | 'allowApplyType'
  | 'applicationCheckType'
  | 'systemRole';
export type GroupTypes = 'team' | 'project';

/** 获取系统角色的请求数据 */
interface GetSystemRolesData {
  typeName: TypeNames;
  groupType: GroupTypes;
  params?: { with_creator?: boolean };
  configs?: AxiosRequestConfig;
}
/** 获取系统角色 */
const getTypes = (
  { typeName, groupType, params, configs } = {} as GetSystemRolesData,
) => {
  return request({
    method: 'GET',
    url: `/v1/types/${toHyphenCase(typeName)}`,
    params: {
      group_type: groupType,
      ...toUnderScoreCase(params),
    },
    ...configs,
  });
};

export default {
  getTypes,
};
