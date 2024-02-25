import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProjectSet } from '../../interfaces';

export interface ProjectSetsState {
  page: number;
  word: string;
  scrollTop: number;
}
export interface ProjectSetState {
  readonly currentProjectSet?: UserProjectSet;
  readonly projectSets: UserProjectSet[];
  readonly projectSetsState: ProjectSetsState;
}

export const initialState: ProjectSetState = {
  projectSets: [],
  projectSetsState: {
    page: 1,
    word: '',
    scrollTop: 0,
  },
};
const slice = createSlice({
  name: 'projectSet',
  initialState,
  reducers: {
    clearProjectSets(state) {
      state.projectSets = [];
    },
    createProjectSet(
      state,
      action: PayloadAction<{ projectSet: UserProjectSet; unshift?: boolean }>,
    ) {
      const { projectSet, unshift = false } = action.payload;
      if (unshift) {
        // 如果第一个是 “未分组” 则插入到其后面
        if (state.projectSets[0]?.default) {
          state.projectSets.splice(1, 0, projectSet);
        } else {
          state.projectSets.unshift(projectSet);
        }
      } else {
        state.projectSets.push(projectSet);
      }
    },
    editProjectSet(state, action: PayloadAction<UserProjectSet>) {
      const index = state.projectSets.findIndex(
        (projectSet) => projectSet.id === action.payload.id,
      );
      if (index > -1) {
        state.projectSets[index] = action.payload;
      }
    },
    deleteProjectSet(state, action: PayloadAction<{ id: string }>) {
      const index = state.projectSets.findIndex(
        (projectSet) => projectSet.id === action.payload.id,
      );
      if (index > -1) {
        state.projectSets.splice(index, 1);
      }
    },
    /** 设置当前编辑/设置的团队 */
    setCurrentProjectSet(state, action: PayloadAction<UserProjectSet>) {
      state.currentProjectSet = action.payload;
    },
    setCurrentProjectSetSaga(state, action: PayloadAction<{ id: string }>) {
      // saga：从服务器获取 ProjectSet
    },
    clearCurrentProjectSet(state) {
      state.currentProjectSet = undefined;
    },
    setProjectSetsState(
      state,
      action: PayloadAction<Partial<ProjectSetsState>>,
    ) {
      state.projectSetsState = { ...state.projectSetsState, ...action.payload };
    },
    resetProjectSetsState(state) {
      state.projectSetsState = initialState.projectSetsState;
    },
  },
});

export const {
  clearProjectSets,
  createProjectSet,
  editProjectSet,
  deleteProjectSet,
  setCurrentProjectSet,
  setCurrentProjectSetSaga,
  clearCurrentProjectSet,
  setProjectSetsState,
  resetProjectSetsState,
} = slice.actions;
export default slice.reducer;
