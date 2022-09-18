import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserTeam } from '../../interfaces';

export interface TeamsState {
  page: number;
  word: string;
  scrollTop: number;
}
export interface TeamState {
  readonly currentTeam?: UserTeam;
  readonly teams: UserTeam[];
  readonly teamsState: TeamsState;
}

export const initialState: TeamState = {
  teams: [],
  teamsState: {
    page: 1,
    word: '',
    scrollTop: 0,
  },
};
const slice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    clearTeams(state) {
      state.teams = [];
    },
    createTeam(
      state,
      action: PayloadAction<{ team: UserTeam; unshift?: boolean }>
    ) {
      const { team, unshift = false } = action.payload;
      if (unshift) {
        state.teams.unshift(team);
      } else {
        state.teams.push(team);
      }
    },
    editTeam(state, action: PayloadAction<UserTeam>) {
      const index = state.teams.findIndex(
        (team) => team.id === action.payload.id
      );
      if (index > -1) {
        state.teams[index] = action.payload;
      }
    },
    deleteTeam(state, action: PayloadAction<{ id: string }>) {
      const index = state.teams.findIndex(
        (team) => team.id === action.payload.id
      );
      if (index > -1) {
        state.teams.splice(index, 1);
      }
    },
    /** 设置当前编辑/设置的团队 */
    setCurrentTeam(state, action: PayloadAction<UserTeam>) {
      state.currentTeam = action.payload;
    },
    setCurrentTeamSaga(state, action: PayloadAction<{ id: string }>) {
      // saga：从服务器获取 Team
    },
    setCurrentTeamInfo(state, action: PayloadAction<Partial<UserTeam>>) {
      if (state.currentTeam) {
        let key: keyof typeof action.payload;
        for (key in action.payload) {
          state.currentTeam[key] = action.payload[key] as never;
        }
        const teamInList = state.teams.find(
          (team) => team.id === state.currentTeam?.id
        );
        if (teamInList) {
          let key: keyof typeof action.payload;
          for (key in action.payload) {
            teamInList[key] = action.payload[key] as never;
          }
        }
      }
    },
    clearCurrentTeam(state) {
      state.currentTeam = undefined;
    },
    setTeamsState(state, action: PayloadAction<Partial<TeamsState>>) {
      state.teamsState = { ...state.teamsState, ...action.payload };
    },
    resetTeamsState(state) {
      state.teamsState = initialState.teamsState;
    },
  },
});

export const {
  clearTeams,
  createTeam,
  editTeam,
  deleteTeam,
  setCurrentTeam,
  setCurrentTeamSaga,
  setCurrentTeamInfo,
  clearCurrentTeam,
  setTeamsState,
  resetTeamsState,
} = slice.actions;
export default slice.reducer;
