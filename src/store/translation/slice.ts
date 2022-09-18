import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TranslationState {
  readonly focusedTranslation: {
    id: string;
  };
}

export const initialState: TranslationState = {
  focusedTranslation: {
    id: '',
  },
};

const slice = createSlice({
  name: 'translation',
  initialState,
  reducers: {
    focusTranslation(
      state,
      action: PayloadAction<{
        id: string;
      }>
    ) {
      state.focusedTranslation.id = action.payload.id;
    },
  },
});

export const { focusTranslation } = slice.actions;
export default slice.reducer;
