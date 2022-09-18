import { cancelled, put, select, takeLatest } from 'redux-saga/effects';
import api from '../../apis';
import { toLowerCamelCase } from '../../utils';
import { getCancelToken } from '../../utils/api';
import { clearCurrentTeam, setCurrentTeam, setCurrentTeamSaga } from './slice';
import { AppState } from '..';
import { UserTeam } from '../../interfaces';

// worker Sage
function* setCurrentTeamWorker(action: ReturnType<typeof setCurrentTeamSaga>) {
  // 清空当前 team
  yield put(clearCurrentTeam());
  const teams = yield select((state: AppState) => state.team.teams);
  const team = teams.find((team: UserTeam) => team.id === action.payload.id);
  if (team) {
    // 已存在与 teams 中，则直接获取
    yield put(setCurrentTeam(team));
  } else {
    // 从 API 获取当前 team
    const [cancelToken, cancel] = getCancelToken();
    try {
      const result = yield api.getTeam({
        id: action.payload.id,
        configs: { cancelToken },
      });
      yield put(setCurrentTeam(toLowerCamelCase(result.data)));
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
  yield takeLatest(setCurrentTeamSaga.type, setCurrentTeamWorker);
}

// root Saga
export default watcher;
