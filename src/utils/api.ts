import axios, { CancelToken, Canceler } from 'axios';

/** 获取用于取消 Axios 请求的 Token 和 Canceler */
const getCancelToken = (): [CancelToken, Canceler] => {
  const source = axios.CancelToken.source();
  const cancel = () => {
    source.cancel('Canceled');
  };
  return [source.token, cancel];
};
export { getCancelToken };
