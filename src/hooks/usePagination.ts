import { Canceler } from 'axios';
import { set } from 'lodash-es';
import React, { useRef, useState } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { BasicSuccessResult, resultTypes } from '@/apis';
import { toLowerCamelCase } from '@/utils';
import { getCancelToken } from '@/utils/api';

type RequestStatus = 'loading' | 'success' | 'failure';
interface UsePaginationParams<T, APIParams> {
  api: (params: APIParams) => Promise<BasicSuccessResult<T[]>>;
  apiParams?: APIParams;
  defaultPage?: number;
  defaultLimit?: number;
  defaultItems?: T[];
}
interface UsePaginationReturn<T> {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  status: RequestStatus;
  setStatus: React.Dispatch<React.SetStateAction<RequestStatus>>;
  refresh: () => void;
}
export function usePagination<T, APIParams>({
  api,
  apiParams = {} as APIParams,
  defaultPage = 1,
  defaultLimit = 50,
  defaultItems = [],
}: UsePaginationParams<T, APIParams>): UsePaginationReturn<T> {
  const [page, setPage] = useState(defaultPage);
  const [limit, setLimit] = useState(defaultLimit);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [refreshToken, setRefreshToken] = useState('');
  const [items, setItems] = useState<T[]>(defaultItems);
  const currentAPIParamsRef = useRef(apiParams);
  const cancelRef = useRef<Canceler>();

  set(apiParams as any, 'params.page', page);
  set(apiParams as any, 'params.limit', limit);

  useDeepCompareEffect(() => {
    if (cancelRef.current) {
      cancelRef.current();
    }
    const [cancelToken, cancel] = getCancelToken();
    cancelRef.current = cancel;
    const configs = (apiParams as any).configs
      ? { ...(apiParams as any).configs, cancelToken }
      : { cancelToken };

    currentAPIParamsRef.current = apiParams;

    setStatus('loading');
    api({ ...apiParams, configs })
      .then((result) => {
        if (apiParams === currentAPIParamsRef.current) {
          const data = toLowerCamelCase(result.data);
          setItems(data);
          setStatus('success');
          setTotal(Number(result.headers['x-pagination-count']));
        }
      })
      .catch((error) => {
        // 如果是 cancel 的请求，则改变请求状态，因为肯定有下一个请求
        if (error.type !== resultTypes.CANCEL_FAILURE) {
          setStatus('failure');
        }
        error.default();
      });
  }, [apiParams, refreshToken]);

  const refresh = () => {
    setRefreshToken(new Date().getTime().toString());
  };

  return {
    page,
    setPage,
    limit,
    setLimit,
    items,
    setItems,
    total,
    setTotal,
    status,
    setStatus,
    refresh,
  };
}
