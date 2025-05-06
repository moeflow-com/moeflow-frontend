import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { Icon } from '.';
import { FC, InputDebounceStatus } from '@/interfaces';
import style from '../style';

/** 输入框防抖状态的属性接口 */
interface DebounceStatusProps {
  status?: InputDebounceStatus;
  tipVisible?: boolean;
  debouncingTip?: string;
  className?: string;
}
/**
 * 输入框防抖状态
 */
export const DebounceStatus: FC<DebounceStatusProps> = ({
  status,
  tipVisible = true,
  debouncingTip,
  className,
} = {}) => {
  const { formatMessage } = useIntl();

  if (!debouncingTip) {
    debouncingTip = formatMessage({ id: 'debounceStatus.debouncing' });
  }
  let sign;
  let tip = '';

  if (status === 'debouncing') {
    sign = (
      <Icon
        className="DebounceStatus__Icon DebounceStatus__Icon--debouncing"
        icon="spinner"
      />
    );
    tip = debouncingTip;
  } else if (status === 'saving') {
    sign = (
      <Icon
        className="DebounceStatus__Icon DebounceStatus__Icon--saving"
        icon="spinner"
        spin={true}
      />
    );
    tip = formatMessage({ id: 'debounceStatus.saving' });
  } else if (status === 'saveFailed') {
    sign = (
      <Icon
        className="DebounceStatus__Icon DebounceStatus__Icon--saveFailed"
        icon="exclamation-triangle"
      />
    );
    tip = formatMessage({ id: 'debounceStatus.saveFailed' });
  } else if (status === 'saveSuccessful') {
    sign = (
      <Icon
        className="DebounceStatus__Icon DebounceStatus__Icon--saveSuccessful"
        icon="save"
      />
    );
    tip = formatMessage({ id: 'debounceStatus.saveSuccessful' });
  }

  return (
    <div
      className={classNames(['DebounceStatus', className])}
      css={css`
        height: 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        .DebounceStatus__Icon {
          color: ${style.textColorSecondary};
          &.DebounceStatus__Icon--debouncing {
            animation: blink 1200ms infinite;
          }
          &.DebounceStatus__Icon--saveSuccessful {
            color: ${style.textColorSecondaryLightest};
          }
          &.DebounceStatus__Icon--saveFailed {
            color: ${style.warningColorLighter};
          }
        }
        .DebounceStatus__Tip {
          font-size: 12px;
          margin-left: 3px;
          color: ${style.textColorSecondary};
        }
        @keyframes blink {
          0% {
            opacity: 1;
          }
          45% {
            opacity: 0.3;
          }
          55% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }
      `}
    >
      {sign}
      {tip && tipVisible && <span className="DebounceStatus__Tip">{tip}</span>}
    </div>
  );
};
