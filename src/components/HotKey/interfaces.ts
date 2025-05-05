export type OSName = 'macos' | 'windows' | 'linux' | undefined;
export type ModifierKey = 'ctrl' | 'alt' | 'shift' | 'meta';
export type HotKeyEvent = {
  key: string;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  displayName: string;
  nativeEvent: KeyboardEvent;
};
export type HotKeyOption = {
  id?: string;
  key?: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  keyDown?: boolean;
  keyUp?: boolean;
  disabled?: boolean;
  /**
   * @deprecated use `disabled`
   */
  disibled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  ignoreKeyboardElement?: boolean;
};
