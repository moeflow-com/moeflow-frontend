import { DependencyList, useEffect } from 'react';
import { MODIFIER_KEY_EVENT_KEYS } from '../constants';
import { HotKeyEvent, HotKeyOption } from '../interfaces';
import { getHotKeyEvent, isKeyboardElement } from '../utils';

export type UseHotKey = {
  (
    option: HotKeyOption,
    callback: (event: HotKeyEvent, option: HotKeyOption) => any,
    deps?: DependencyList
  ): void;
};
export const useHotKey: UseHotKey = (option, callback, deps = []) => {
  const {
    key,
    ctrl = false,
    alt = false,
    shift = false,
    meta = false,
    keyDown = true,
    keyUp = false,
    disibled = false,
    preventDefault = true,
    stopPropagation = true,
    ignoreKeyboardElement = true,
  } = option;

  useEffect(() => {
    if (disibled) return;
    const listener = (nativeEvent: KeyboardEvent) => {
      // Ignore modifier keys
      if (MODIFIER_KEY_EVENT_KEYS.includes(nativeEvent.key)) return;
      // Ignore disabled elements
      if (
        ignoreKeyboardElement &&
        isKeyboardElement(nativeEvent.target as HTMLElement)
      ) {
        return;
      }
      // If key set, ignore key not match
      const event = getHotKeyEvent(nativeEvent);
      if (key !== undefined) {
        if (event.key !== key) return;
        if (event.ctrl !== ctrl) return;
        if (event.alt !== alt) return;
        if (event.shift !== shift) return;
        if (event.meta !== meta) return;
      }
      if (preventDefault) nativeEvent.preventDefault();
      if (stopPropagation) nativeEvent.stopPropagation();
      callback(event, option);
    };
    if (keyDown) window.addEventListener('keydown', listener);
    if (keyUp) window.addEventListener('keyup', listener);
    return () => {
      if (keyDown) window.removeEventListener('keydown', listener);
      if (keyUp) window.removeEventListener('keyup', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    key,
    ctrl,
    alt,
    shift,
    meta,
    keyDown,
    keyUp,
    disibled,
    preventDefault,
    stopPropagation,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...deps,
  ]);
};
