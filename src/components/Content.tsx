import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { FC } from '../interfaces';
import style from '../style';

/** 一般内容 Body 的属性接口 */
interface ContentProps {
  className?: string;
}
/**
 * 一般内容 Body
 */
export const Content: FC<ContentProps> = ({ children, className }) => {
  return (
    <div
      className={classNames(['Content', className])}
      css={css`
        margin-bottom: ${style.paddingBase + 10}px;
      `}
    >
      {children}
    </div>
  );
};
