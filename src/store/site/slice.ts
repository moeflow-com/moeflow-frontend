import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OSName, Platform } from '../../interfaces';

export interface SiteState {
  osName?: OSName;
  platform?: Platform;
  newInvitationsCount: number;
  relatedApplicationsCount: number;
}

const initialState: SiteState = {
  osName: 'windows',
  platform: 'desktop',
  relatedApplicationsCount: 0,
  newInvitationsCount: 0,
};
const slice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setPlatform(state, action: PayloadAction<Platform>) {
      state.platform = action.payload;
    },
    setOSName(state, action: PayloadAction<OSName>) {
      state.osName = action.payload;
    },
    setRelatedApplicationsCount(state, action: PayloadAction<number>) {
      state.relatedApplicationsCount = action.payload;
    },
    setNewInvitationsCount(state, action: PayloadAction<number>) {
      state.newInvitationsCount = action.payload;
    },
  },
});

export const {
  setPlatform,
  setOSName,
  setRelatedApplicationsCount,
  setNewInvitationsCount,
} = slice.actions;
export default slice.reducer;
