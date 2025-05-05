import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import siteReducer from './site/slice';
import teamReducer from './team/slice';
import teamSaga from './team/sagas';
import projectSetReducer from './projectSet/slice';
import projectSetSaga from './projectSet/sagas';
import projectReducer from './project/slice';
import fileReducer from './file/slice';
import projectSaga from './project/sagas';
import userReducer from './user/slice';
import userSaga from './user/sagas';
import sourceReducer from './source/slice';
import sourceSaga from './source/sagas';
import hotKeyReducer from './hotKey/slice';
import imageTranslatorReducer from './imageTranslator/slice';
import translationReducer from './translation/slice';

// 组合各个 Reducers
const rootReducer = combineReducers({
  site: siteReducer,
  user: userReducer,
  team: teamReducer,
  projectSet: projectSetReducer,
  project: projectReducer,
  file: fileReducer,
  source: sourceReducer,
  hotKey: hotKeyReducer,
  imageTranslator: imageTranslatorReducer,
  translation: translationReducer,
});

function* rootSaga() {
  yield all([
    userSaga(),
    teamSaga(),
    projectSetSaga(),
    projectSaga(),
    sourceSaga(),
  ]);
}
export type AppState = ReturnType<typeof rootReducer>;

function createStore() {
  // 创建 Sage 中间件
  const sagaMiddleware = createSagaMiddleware();
  // 创建 Store
  const store = configureStore({
    reducer: rootReducer,
    middleware: [sagaMiddleware],
  });
  // 执行 Sage 中间件
  sagaMiddleware.run(rootSaga);
  return store;
}

const store = createStore();
export default store;
