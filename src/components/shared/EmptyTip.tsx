import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { FC } from '@/interfaces';
import style from '@/style';

/** 空提示的属性接口 */
interface EmptyTipProps {
  text: string | React.ReactNode | React.ReactNode[];
  buttons?: React.ReactNode | React.ReactNode[];
  className?: string;
}
/**
 * 空提示
 */
export const EmptyTip: FC<EmptyTipProps> = ({ text, buttons, className }) => {
  return (
    <div
      className={classNames(['EmptyTip', className])}
      css={css`
        flex: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: ${style.textColorSecondary};
        padding: ${style.paddingBase}px;
        text-align: center;
        user-select: none;
        .EmptyTip__Buttons {
          margin-top: 10px;
        }
      `}
    >
      <div className="EmptyTip__Text">{text}</div>
      <div className="EmptyTip__Buttons">{buttons}</div>
    </div>
  );
};
