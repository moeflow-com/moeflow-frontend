import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HotKeyOption } from '../../components/HotKey/interfaces';
import { OSName } from '../../interfaces';

export const getDefaultHotKey = ({
  name,
  index,
  osName,
}: {
  name: keyof HotKeyState;
  index: number;
  osName: OSName;
}): HotKeyOption | undefined => {
  const options: { macos: HotKeyState; windows: HotKeyState } = {
    macos: {
      focusNextSource: [
        { key: 'Tab', ignoreKeyboardElement: false },
        { key: 'Enter', meta: true, ignoreKeyboardElement: false },
      ],
      focusPrevSource: [
        { key: 'Tab', shift: true, ignoreKeyboardElement: false },
      ],
      goNextPage: [
        { key: 'ArrowRight', meta: true, ignoreKeyboardElement: false },
      ],
      goPrevPage: [
        { key: 'ArrowLeft', meta: true, ignoreKeyboardElement: false },
      ],
    },
    windows: {
      focusNextSource: [
        { key: 'Tab', ignoreKeyboardElement: false },
        { key: 'Enter', ctrl: true, ignoreKeyboardElement: false },
      ],
      focusPrevSource: [
        { key: 'Tab', shift: true, ignoreKeyboardElement: false },
      ],
      goNextPage: [
        { key: 'ArrowRight', ctrl: true, ignoreKeyboardElement: false },
      ],
      goPrevPage: [
        { key: 'ArrowLeft', ctrl: true, ignoreKeyboardElement: false },
      ],
    },
  };
  if (osName === 'macos') {
    return options['macos'][name][index];
  } else {
    return options['windows'][name][index];
  }
};

export interface HotKeyState {
  focusNextSource: (HotKeyOption | undefined)[];
  focusPrevSource: (HotKeyOption | undefined)[];
  goNextPage: (HotKeyOption | undefined)[];
  goPrevPage: (HotKeyOption | undefined)[];
}

export const hotKeyInitialState: HotKeyState = {
  focusNextSource: [],
  focusPrevSource: [],
  goNextPage: [],
  goPrevPage: [],
};

const slice = createSlice({
  name: 'hotKey',
  initialState: hotKeyInitialState,
  reducers: {
    setHotKey(
      state,
      action: PayloadAction<{
        name: keyof HotKeyState;
        index: number;
        option?: HotKeyOption;
      }>,
    ) {
      const { name, index, option } = action.payload;
      state[name][index] = option;
    },
  },
});

export const { setHotKey } = slice.actions;
export default slice.reducer;
