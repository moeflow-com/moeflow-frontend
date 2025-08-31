import { message } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import qs from 'qs';
import { createElement } from 'react';
import { Icon } from '../components';
import { runtimeConfig } from '@/configs';
import { createDebugLogger } from '@/utils/debug-logger';
import { getIntl } from '@/locales';
import store from '../store';
import { setUserToken } from '@/store/user/slice';
import { toFormErrors, toLowerCamelCase } from '@/utils';
import application from './application';
import auth from './auth';
import file from './file';
import invitation from './invitation';
import language from './language';
import me from './me';
import member from './member';
import output from './output';
import project from './project';
import projectSet from './projectSet';
import source from './source';
import target from './target';
import team from './team';
import tip from './tip';
import translation from './translation';
import type from './type';
import user from './user';
import group from './group';
import insight from './insight';
import siteSetting from './siteSetting';
import { lazyThenable } from '@jokester/ts-commonutil/lib/concurrency/lazy-thenable';

const debugLogger = createDebugLogger('apis');

const instanceP = lazyThenable(() => {
  return runtimeConfig.then((r) => {
    const token = store.getState().user.token;
    // dev-only workaround: hot reload may create another instanceP with no common headers sets
    const commonHeaders =
      process.env.NODE_ENV === 'development' && token
        ? { Authorization: `Bearer ${token}` }
        : {};
    return axios.create({
      baseURL: `${r.baseURL}`,
      headers: {
        common: commonHeaders,
      },
    });
  });
});

let languageInterceptor: number | null = null;

export async function getAxiosInstance() {
  return instanceP;
}

/**
 * @param l
 * (as backend User.locale is not used , this solely determines locale in backend API handler)
 */
export async function setRequestLanguage(l: string) {
  // Remove existing interceptor if any
  const instance = await instanceP;
  if (languageInterceptor !== null) {
    instance.interceptors.request.eject(languageInterceptor);
  }
  // Add new interceptor and store its ID
  languageInterceptor = instance.interceptors.request.use((req) => {
    debugLogger('axios request interceptor: language', l, req);
    return {
      ...req,
      headers: {
        ...req.headers,
        'Accept-Language': l,
      },
    } as unknown as typeof req;
  });
}

/** 分页的请求参数 */
export interface PaginationParams {
  /** 页数 */
  page?: number;
  /** 每页元素个数 */
  limit?: number;
}

/**
 * @enum
 */
export const resultTypes = {
  SUCCESS: 'SUCCESS',
  BASIC_FAILURE: 'BASIC_FAILURE',
  VALIDATION_FAILURE: 'VALIDATION_FAILURE',
  NETWORK_FAILURE: 'NETWORK_FAILURE',
  CANCEL_FAILURE: 'CANCEL_FAILURE',
  OTHER_FAILURE: 'OTHER_FAILURE',
} as const;

/** 成功的响应 */
export interface BasicSuccessResult<T = unknown> {
  type: typeof resultTypes.SUCCESS;
  data: T;
  headers: Partial<AxiosHeaders>;
}

/** 基础错误响应结果的数据 */
interface BasicFailureResultData {
  /** 错误代码 */
  code: number;
  /** 错误类名 */
  error: string;
  /** 支持 i18n 的错误信息 */
  message: string;
}

/** 基础错误响应结果 */
interface BasicFailureResult {
  type: typeof resultTypes.BASIC_FAILURE;
  data: BasicFailureResultData;
  default: () => void;
}

/** 验证错误响应结果的数据 */
interface ValidationFailureResultData {
  /** 错误代码 */
  code: 2;
  /** 错误类名 */
  error: string;
  /** 每个错误字段的支持 i18n 的错误信息 */
  message: { [fieldNames: string]: string[] };
}

/** 验证错误响应结果 */
interface ValidationFailureResult {
  type: typeof resultTypes.VALIDATION_FAILURE;
  data: ValidationFailureResultData;
  default: (form?: FormInstance) => void;
}

/** 网络错误响应结果 */
interface NetworkFailureResult {
  type: typeof resultTypes.NETWORK_FAILURE;
  default: () => void;
}

/** 取消响应结果 */
interface CancelFailureResult {
  type: typeof resultTypes.CANCEL_FAILURE;
  default: () => void;
}

/** 其他响应结果 */
interface OtherFailureResult {
  type: typeof resultTypes.OTHER_FAILURE;
  default: () => void;
}

/** 所有错误类型 */
export type FailureResults =
  | BasicFailureResult
  | ValidationFailureResult
  | NetworkFailureResult
  | CancelFailureResult
  | OtherFailureResult;

export async function request<T = unknown>(
  axiosConfig: AxiosRequestConfig,
): Promise<BasicSuccessResult<T>> {
  const instance = await instanceP;
  return instance({
    // param=value1&param=value2，去除 query 中数组的 [] 结尾
    paramsSerializer: function (params) {
      return qs.stringify(params, { indices: false });
    },
    ...axiosConfig,
  })
    .then((response: AxiosResponse) => {
      const result: BasicSuccessResult<T> = {
        type: resultTypes.SUCCESS,
        data: response.data,
        headers: response.headers,
      };
      return result;
    })
    .catch((error: AxiosError) => {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        if (error.response.data.code === 2) {
          // 将 message 中的字段名转为小驼峰
          error.response.data.message = toLowerCamelCase(
            error.response.data.message,
          );
          // 验证错误
          const result: ValidationFailureResult = {
            type: resultTypes.VALIDATION_FAILURE,
            data: error.response.data,
            default: validateBasicFailure(error.response.data),
          };
          throw result;
        } else if (error.response.status === 401) {
          // token 错误
          const result: BasicFailureResult = {
            type: resultTypes.BASIC_FAILURE,
            data: error.response.data,
            default: () => {
              // 清理 token
              // store.dispatch(setUserToken({ token: '' }));
            },
          };
          throw result;
        } else {
          // 基础错误
          const result: BasicFailureResult = {
            type: resultTypes.BASIC_FAILURE,
            data: error.response.data,
            default: defaultBasicFailure(error.response.data),
          };
          throw result;
        }
      } else {
        if (error.message === 'Network Error') {
          // 网络错误
          const result: NetworkFailureResult = {
            type: resultTypes.NETWORK_FAILURE,
            default: defaultNetworkFailure,
          };
          throw result;
        } else if (error.message === 'Canceled') {
          // 上一个请求被终止了
          const result: CancelFailureResult = {
            type: resultTypes.CANCEL_FAILURE,
            default: () => {}, // 什么都不做
          };
          throw result;
        } else {
          // 其他错误
          const result: OtherFailureResult = {
            type: resultTypes.OTHER_FAILURE,
            default: () => {}, // 什么都不做
          };
          throw result;
        }
      }
    });
}

/** 基础错误的默认行为 [生成器] */
const defaultBasicFailure = (data: BasicFailureResultData) => {
  return () => {
    // 使用 antd message 显示错误信息
    message.error({
      content: data.message,
      key: 'requestBasicFailure',
    });
  };
};
/** 验证错误的默认行为 [生成器] */
const validateBasicFailure = (data: ValidationFailureResultData) => {
  // 什么都不做，需要将错误信息放入 Form 内
  return (form?: FormInstance) => {
    if (form) {
      // 如果提供了 form，则将错误写入其中
      const errors = toFormErrors(data.message);
      form.setFields(errors);
    }
    // 否则什么都不做
  };
};
/** 网络错误时默认的行为 */
const defaultNetworkFailure = () => {
  const intl = getIntl();

  message.error({
    icon: createElement(Icon, {
      icon: 'wifi',
      style: {
        marginRight: '8px',
        paddingBottom: '1px',
        color: '#ff4d4f',
      },
    }),
    content: intl.formatMessage({ id: 'api.networkError' }),
    key: 'requestNetworkError',
    duration: 1,
  });
};

export const api = {
  getAxiosInstance,
  // TODO switch to this nested  / drop use of default export
  application,
  auth,
  file,
  group,
  insight,
  // invitation,
  language,
  // mitPreprocess,
  me,
  member,
  output,
  project,
  projectSet,
  siteSetting,
  source,
  target,
  team,
  tip,
  translation,
  type,
  user,
} as const;
/**
 * @deprecated use named import
 */
export default {
  ...auth,
  ...type,
  ...group,
  ...team,
  ...projectSet,
  ...project,
  ...member,
  ...user,
  ...me,
  ...invitation,
  ...application,
  ...language,
  ...target,
  ...file,
  ...source,
  ...translation,
  ...tip,
  ...output,
  ...insight,
  ...siteSetting,
};
