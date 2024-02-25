import { createSlice, PayloadAction } from '@reduxjs/toolkit';
export interface FilesState {
  page: number;
  word: string;
  scrollTop: number;
  selectedFileIds: string[];
}
export interface FileState {
  readonly filesState: FilesState;
}

export const initialState: FileState = {
  filesState: {
    page: 1,
    word: '',
    scrollTop: 0,
    selectedFileIds: [],
  },
};

const slice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setFilesState(state, action: PayloadAction<Partial<FilesState>>) {
      state.filesState = { ...state.filesState, ...action.payload };
    },
    resetFilesState(state) {
      state.filesState = initialState.filesState;
    },
  },
});

export const { setFilesState, resetFilesState } = slice.actions;
export default slice.reducer;
