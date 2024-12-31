import { cancelled, put, select, takeLatest } from 'redux-saga/effects';
import { api, BasicSuccessResult } from '@/apis';
import { toLowerCamelCase } from '@/utils';
import { getCancelToken } from '@/utils/api';
import {
  clearCurrentProject,
  setCurrentProject,
  setCurrentProjectSaga,
} from './slice';
import { AppState } from '@/store';
import { Project } from '@/interfaces';

// worker Sage
function* setCurrentProjectWorker(
  action: ReturnType<typeof setCurrentProjectSaga>,
) {
  // 清空当前 project
  yield put(clearCurrentProject());
  const projects: Project[] = yield select(
    (state: AppState) => state.project.projects,
  );
  const project = projects.find(
    (project: Project) => project.id === action.payload.id,
  );
  if (project) {
    // 已存在与 projects 中，则直接获取
    yield put(setCurrentProject(project));
  } else {
    // 从 API 获取当前 project
    const [cancelToken, cancel] = getCancelToken();
    try {
      const result: BasicSuccessResult<Project> = yield api.project.getProject({
        id: action.payload.id,
        configs: { cancelToken },
      });
      yield put(setCurrentProject(toLowerCamelCase(result.data)));
    } catch (error) {
      error.default();
    } finally {
      if (yield cancelled()) {
        cancel();
      }
    }
  }
}

// watcher Saga
function* watcher() {
  yield takeLatest(setCurrentProjectSaga.type, setCurrentProjectWorker);
}

// root Saga
export default watcher;
