import { AxiosRequestConfig } from 'axios';
import { request } from '.';
import { APIUser } from './user';

export interface APITip {
  sourceID: string;
  id: string;
  content: string;
  user: APIUser | null;
  createTime: string;
  editTime: string;
}

/** 新增原文的请求数据 */
interface CreateTipData {
  content: string;
}
/** 新增原文 */
const createTip = ({
  sourceID,
  data,
  configs,
}: {
  sourceID: string;
  data: CreateTipData;
  configs?: AxiosRequestConfig;
}) => {
  return request<APITip>({
    method: 'POST',
    url: `/v1/sources/${sourceID}/tips`,
    data: data,
    ...configs,
  });
};

/** 修改原文的请求数据 */
interface EditTipData {
  content: string;
}
/** 修改原文 */
const editTip = ({
  tipID,
  data,
  configs,
}: {
  tipID: string;
  data: EditTipData;
  configs?: AxiosRequestConfig;
}) => {
  return request<APITip>({
    method: 'PUT',
    url: `/v1/tips/${tipID}`,
    data: data,
    ...configs,
  });
};

/** 删除原文 */
const deleteTip = ({
  tipID,
  configs,
}: {
  tipID: string;
  configs?: AxiosRequestConfig;
}) => {
  return request<APITip>({
    method: 'DELETE',
    url: `/v1/tips/${tipID}`,
    ...configs,
  });
};

export default {
  createTip,
  deleteTip,
  editTip,
};
