import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { FC } from '@/interfaces';
import { AppState } from '@/store';
import { HotKeyState, setHotKey } from '@/store/hotKey/slice';
import { saveHotKey } from '@/utils/storage';
import { HotKeyRecorder } from '@/components/HotKey';
import {
  ARROW_KEY_EVENT_CODES,
  MAIN_KEY_EVENT_CODES,
  SPACE_KEY_EVENT_CODES,
} from '@/components/HotKey/constants';
import { HotKeyEvent } from '@/components/HotKey/interfaces';

/** 快捷键设置的属性接口 */
interface ImageTranslatorSettingHotKeyProps {
  className?: string;
}
/**
 * 快捷键设置
 */
export const ImageTranslatorSettingHotKey: FC<
  ImageTranslatorSettingHotKeyProps
> = ({ className }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const focusNextSourceHotKeyOptions = useSelector(
    (state: AppState) => state.hotKey.focusNextSource,
  );
  const focusPrevSourceHotKeyOptions = useSelector(
    (state: AppState) => state.hotKey.focusPrevSource,
  );
  const goPrevPageHotKeyOptions = useSelector(
    (state: AppState) => state.hotKey.goPrevPage,
  );
  const goNextPageHotKeyOptions = useSelector(
    (state: AppState) => state.hotKey.goNextPage,
  );

  const handleHotKeyChange = ({
    name,
    index,
    hotKey,
  }: {
    name: keyof HotKeyState;
    index: number;
    hotKey?: HotKeyEvent;
  }) => {
    if (hotKey) {
      if (
        MAIN_KEY_EVENT_CODES.includes(hotKey.key) &&
        hotKey.shift === true &&
        hotKey.ctrl === false &&
        hotKey.alt === false &&
        hotKey.meta === false
      ) {
        alert(
          '请勿设置 Shift + 字母/数字/符号 的快捷键，这样会导致输入框中无法输入此大写字母/符号。',
        );
        return;
      }
      if (
        [
          ...MAIN_KEY_EVENT_CODES,
          ...ARROW_KEY_EVENT_CODES,
          ...SPACE_KEY_EVENT_CODES,
        ].includes(hotKey.key) &&
        hotKey.shift === false &&
        hotKey.ctrl === false &&
        hotKey.alt === false &&
        hotKey.meta === false
      ) {
        alert(
          '请勿设置 只含有字母/数字/符号/箭头/空格 等快捷键，这样会导致输入框中无法使用此按键。',
        );
        return;
      }
    }
    const option = hotKey
      ? {
          key: hotKey.key,
          shift: hotKey.shift,
          ctrl: hotKey.ctrl,
          alt: hotKey.alt,
          meta: hotKey.meta,
          ignoreKeyboardElement: false,
        }
      : undefined;
    dispatch(setHotKey({ name, index, option }));
    saveHotKey({ name, index, option });
  };

  return (
    <div
      className={classNames(['ImageTranslatorSettingHotKey', className])}
      css={css`
        display: grid;
        grid-template-columns: 100px 1fr 1fr;
        grid-row-gap: 10px;
        grid-column-gap: 10px;
        align-items: center;
        .ImageTranslatorSettingHotKey__HeaderLabel {
          font-weight: bold;
          line-height: 32px;
        }
      `}
    >
      <div className="ImageTranslatorSettingHotKey__HeaderLabel">
        {formatMessage({ id: 'hotKey.function' })}
      </div>
      <div className="ImageTranslatorSettingHotKey__HeaderLabel">
        {formatMessage({ id: 'hotKey.mainHotKey' })}
      </div>
      <div className="ImageTranslatorSettingHotKey__HeaderLabel">
        {formatMessage({ id: 'hotKey.subHotKey' })}
      </div>
      <div className="ImageTranslatorSettingHotKey__Label">
        {formatMessage({ id: 'hotKey.focusPrevSource' })}
      </div>
      <HotKeyRecorder
        hotKey={focusPrevSourceHotKeyOptions[0]}
        onHotKeyChange={(hotKey) => {
          handleHotKeyChange({ name: 'focusPrevSource', index: 0, hotKey });
        }}
      />
      <HotKeyRecorder
        hotKey={focusPrevSourceHotKeyOptions[1]}
        onHotKeyChange={(hotKey) => {
          handleHotKeyChange({ name: 'focusPrevSource', index: 1, hotKey });
        }}
      />
      <div className="ImageTranslatorSettingHotKey__Label">
        {formatMessage({ id: 'hotKey.focusNextSource' })}
      </div>
      <HotKeyRecorder
        hotKey={focusNextSourceHotKeyOptions[0]}
        onHotKeyChange={(hotKey) => {
          handleHotKeyChange({ name: 'focusNextSource', index: 0, hotKey });
        }}
      />
      <HotKeyRecorder
        hotKey={focusNextSourceHotKeyOptions[1]}
        onHotKeyChange={(hotKey) => {
          handleHotKeyChange({ name: 'focusNextSource', index: 1, hotKey });
        }}
      />
      <div className="ImageTranslatorSettingHotKey__Label">
        {formatMessage({ id: 'hotKey.goPrevPage' })}
      </div>
      <HotKeyRecorder
        hotKey={goPrevPageHotKeyOptions[0]}
        onHotKeyChange={(hotKey) => {
          handleHotKeyChange({ name: 'goPrevPage', index: 0, hotKey });
        }}
      />
      <HotKeyRecorder
        hotKey={goPrevPageHotKeyOptions[1]}
        onHotKeyChange={(hotKey) => {
          handleHotKeyChange({ name: 'goPrevPage', index: 1, hotKey });
        }}
      />
      <div className="ImageTranslatorSettingHotKey__Label">
        {formatMessage({ id: 'hotKey.goNextPage' })}
      </div>
      <HotKeyRecorder
        hotKey={goNextPageHotKeyOptions[0]}
        onHotKeyChange={(hotKey) => {
          handleHotKeyChange({ name: 'goNextPage', index: 0, hotKey });
        }}
      />
      <HotKeyRecorder
        hotKey={goNextPageHotKeyOptions[1]}
        onHotKeyChange={(hotKey) => {
          handleHotKeyChange({ name: 'goNextPage', index: 1, hotKey });
        }}
      />
    </div>
  );
};
