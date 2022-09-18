import { osName } from '.';
import { HotKeyOption, HotKeyEvent, ModifierKey } from './interfaces';

export const isKeyboardElement = (element: HTMLElement): boolean => {
  if (
    ['INPUT', 'TEXTAREA'].includes(element.tagName) &&
    !(element as HTMLInputElement | HTMLTextAreaElement).readOnly
  ) {
    return true;
  }
  if (element.tagName === 'SELECT') {
    return true;
  }
  if (element.isContentEditable) {
    return true;
  }
  return false;
};

export const getModifierKeyDisplayName = (modifierKey: ModifierKey): string => {
  let osKeyName: string = modifierKey;
  if (osName === 'macos') {
    osKeyName = {
      ctrl: 'Control',
      alt: 'Option',
      shift: 'Shift',
      meta: 'Command',
    }[modifierKey];
  } else if (osName === 'windows') {
    osKeyName = {
      ctrl: 'Ctrl',
      alt: 'Alt',
      shift: 'Shift',
      meta: 'Win',
    }[modifierKey];
  } else {
    osKeyName = {
      ctrl: 'Ctrl',
      alt: 'Alt',
      shift: 'Shift',
      meta: 'Meta',
    }[modifierKey];
  }
  return osKeyName;
};

export const getHotKeyDisplayName = ({
  key = '',
  ctrl = false,
  alt = false,
  shift = false,
  meta = false,
}: HotKeyOption): string => {
  let diaplayName = '';
  diaplayName += ctrl ? getModifierKeyDisplayName('ctrl') + '+' : '';
  diaplayName += alt ? getModifierKeyDisplayName('alt') + '+' : '';
  diaplayName += shift ? getModifierKeyDisplayName('shift') + '+' : '';
  diaplayName += meta ? getModifierKeyDisplayName('meta') + '+' : '';
  diaplayName += key;
  return diaplayName;
};

export const getHotKeyEvent = (nativeEvent: KeyboardEvent): HotKeyEvent => {
  const event: HotKeyEvent = {
    displayName: '',
    key: nativeEvent.code,
    ctrl: nativeEvent.ctrlKey,
    alt: nativeEvent.altKey,
    shift: nativeEvent.shiftKey,
    meta: nativeEvent.metaKey,
    nativeEvent: nativeEvent,
  };
  event.displayName = getHotKeyDisplayName(event);
  return event;
};
