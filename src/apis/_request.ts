import { BasicSuccessResult, request } from '.';
import { AxiosRequestConfig } from 'axios';

export async function uploadRequest<T = unknown>(
  data: FormData,
  configs: AxiosRequestConfig,
): Promise<BasicSuccessResult<T>> {
  return request({
    data,
    ...configs,
    headers: {
      ...configs.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
}
