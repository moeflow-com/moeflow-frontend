import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PROJECT_STATUS } from '../../constants';
import { Project } from '../../interfaces';

export interface ProjectsState {
  page: number;
  word: string;
  scrollTop: number;
  status: PROJECT_STATUS;
}
export interface ProjectState {
  readonly currentProject?: Project;
  readonly projects: Project[];
  readonly projectsState: ProjectsState;
}

export const initialState: ProjectState = {
  projects: [],
  projectsState: {
    page: 1,
    word: '',
    scrollTop: 0,
    status: PROJECT_STATUS.WORKING,
  },
};
const slice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearProjects(state) {
      state.projects = [];
    },
    createProject(
      state,
      action: PayloadAction<{ project: Project; unshift?: boolean }>,
    ) {
      const { project, unshift = false } = action.payload;
      if (unshift) {
        state.projects.unshift(project);
      } else {
        state.projects.push(project);
      }
    },
    editProject(state, action: PayloadAction<Project>) {
      const index = state.projects.findIndex(
        (project) => project.id === action.payload.id,
      );
      if (index > -1) {
        state.projects[index] = action.payload;
      }
    },
    deleteProject(state, action: PayloadAction<{ id: string }>) {
      const index = state.projects.findIndex(
        (project) => project.id === action.payload.id,
      );
      if (index > -1) {
        state.projects.splice(index, 1);
      }
    },
    /** 设置当前编辑/设置的团队 */
    setCurrentProject(state, action: PayloadAction<Project>) {
      state.currentProject = action.payload;
    },
    setCurrentProjectSaga(state, action: PayloadAction<{ id: string }>) {
      // saga：从服务器获取 Project
    },
    clearCurrentProject(state) {
      state.currentProject = undefined;
    },
    increaseCurrentProjectTargetCount(
      state,
      action: PayloadAction<{ id: string; step: number }>,
    ) {
      if (state.currentProject) {
        state.currentProject.targetCount += action.payload.step;
      }
      // 同时也修改列表中的项目
      const index = state.projects.findIndex(
        (project) => project.id === action.payload.id,
      );
      if (index > -1) {
        state.projects[index].targetCount += action.payload.step;
      }
    },
    setProjectsState(state, action: PayloadAction<Partial<ProjectsState>>) {
      state.projectsState = { ...state.projectsState, ...action.payload };
    },
    resetProjectsState(state) {
      state.projectsState = initialState.projectsState;
    },
  },
});

export const {
  clearProjects,
  createProject,
  editProject,
  deleteProject,
  setCurrentProject,
  setCurrentProjectSaga,
  clearCurrentProject,
  increaseCurrentProjectTargetCount,
  setProjectsState,
  resetProjectsState,
} = slice.actions;
export default slice.reducer;
