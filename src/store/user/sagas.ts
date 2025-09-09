import { put, takeEvery } from 'redux-saga/effects';
import { initialState, setUserInfo, setUserToken } from './slice';
import { toLowerCamelCase } from '../../utils';
import { api, BasicSuccessResult } from '../../apis';
import { setToken, removeToken } from '../../utils/cookie';
import { GetUserInfoResponse } from '../../apis/auth';
import type { Axios } from 'axios';

// worker Sage
function* getUserInfoAsync(action: ReturnType<typeof setUserToken>) {
  const token = action.payload.token;
  const instance: Axios = yield api.getAxiosInstance();
  if (token === '') {
    if (process.env.NODE_ENV === 'development') {
      // do nothing in dev: vite hot reloading may create APIClient multiple times,
      // causing 401 and an empty token being set
      return;
    }
    // 清除 Axios Authorization 头
    delete instance.defaults.headers.common['Authorization'];
    // 清除 Cookie token
    removeToken();
    // 清除 Store 用户信息
    yield put(setUserInfo(initialState));
  } else {
    // 设置 Axios Authorization 头
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // 设置 Cookie token
    if (!action.payload.refresh) {
      setToken(token, action.payload.rememberMe);
    }
    // 获取并记录用户信息到 Store
    try {
      const result: BasicSuccessResult<GetUserInfoResponse> =
        yield api.auth.getUserInfo({
          data: { token },
        });
      yield put(setUserInfo(toLowerCamelCase(result.data)));
    } catch (error: any) {
      error.default();
    }
  }
}

// watcher Saga
function* watcher() {
  yield takeEvery(setUserToken.type, getUserInfoAsync);
}

// root Saga
export default watcher;
