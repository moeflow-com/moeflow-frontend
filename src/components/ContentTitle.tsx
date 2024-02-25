import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { FC } from '../interfaces';
import style from '../style';

/** 一般内容标题的属性接口 */
interface ContentTitleProps {
  className?: string;
}
/**
 * 一般内容标题
 */
export const ContentTitle: FC<ContentTitleProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={classNames(['ContentTitle', className])}
      css={css`
        width: 100%;
        color: ${style.primaryColor};
        font-weight: bold;
        font-size: 18px;
        margin-bottom: ${style.paddingBase}px;
      `}
    >
      {children}
    </div>
  );
};
