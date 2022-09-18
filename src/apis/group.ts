import { AxiosRequestConfig } from 'axios';
import { request } from '.';
import { toPlural } from '../utils';
import { GroupTypes } from './type';

export interface APIGroupPublicInfo {
  id: string;
  name: string;
  joined: boolean;
  userCount: number;
  applicationCheckType: number;
}

/** 获取团体申请列表 */
const getGroupPublicInfo = ({
  groupType,
  groupID,
  configs,
}: {
  groupType: GroupTypes;
  groupID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request<APIGroupPublicInfo>({
    method: 'GET',
    url: `/v1/${toPlural(groupType)}/${groupID}/public-info`,
    ...configs,
  });
};

export default {
  getGroupPublicInfo,
};
