import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TranslatorMode = 'source' | 'translator' | 'proofreader' | 'god';
export interface ImageTranslator {
  readonly mode: TranslatorMode;
}

const initialState: ImageTranslator = {
  mode: 'translator',
};
const slice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setImageTranslatorMode(state, action: PayloadAction<TranslatorMode>) {
      state.mode = action.payload;
    },
  },
});

export const { setImageTranslatorMode } = slice.actions;
export default slice.reducer;
