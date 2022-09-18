import { css } from '@emotion/core';
import { Button, Input } from 'antd';
import classNames from 'classnames';
import React, { FC, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { MODIFIER_KEY_EVENT_KEYS } from '../constants';
import { HotKeyEvent, HotKeyOption } from '../interfaces';
import { getHotKeyDisplayName, getHotKeyEvent } from '../utils';

/** 热键设置器的属性接口 */
interface HotKeyRecorderProps {
  hotKey?: HotKeyOption;
  onHotKeyChange?: (hotKey?: HotKeyEvent) => void;
  className?: string;
}
/**
 * 热键设置器
 */
export const HotKeyRecorder: FC<HotKeyRecorderProps> = ({
  hotKey,
  onHotKeyChange,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n

  const placeholder = hotKey
    ? getHotKeyDisplayName(hotKey)
    : formatMessage({ id: 'hotKeyRecorder.null' });
  const [value, setValue] = useState('');
  const domRef = useRef<Input>(null);

  return (
    <div
      className={classNames(['HotKeyRecorder', className])}
      css={css`
        display: flex;
        .HotKeyRecorder__Input {
          flex: auto;
        }
        .HotKeyRecorder__DeleteButton {
          margin-left: 8px;
        }
      `}
    >
      <Input
        className="HotKeyRecorder__Input"
        placeholder={placeholder}
        value={value}
        ref={domRef}
        onFocus={() => setValue(formatMessage({ id: 'hotKeyRecorder.tip' }))}
        onBlur={() => setValue('')}
        onKeyDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          // Ignore modifier keys
          if (MODIFIER_KEY_EVENT_KEYS.includes(e.nativeEvent.key)) return;
          const event = getHotKeyEvent(e.nativeEvent);
          onHotKeyChange?.(event);
          domRef.current?.blur();
        }}
        readOnly
      />
      {hotKey && (
        <Button
          className="HotKeyRecorder__DeleteButton"
          onClick={() => {
            onHotKeyChange?.(undefined);
          }}
        >
          {formatMessage({ id: 'hotKeyRecorder.unbind' })}
        </Button>
      )}
    </div>
  );
};
