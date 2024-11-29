import { css } from '@emotion/core';
import React from 'react';
import { FC } from '@/interfaces';

/**
 * 可移动区域纯色背景属性接口
 */
interface MovableAreaColorBackgroundProps {
  color: string;
  className?: string;
}
/**
 * 可移动区域纯色背景
 */
export const MovableAreaColorBackground: FC<
  MovableAreaColorBackgroundProps
> = ({ color, className }) => {
  return (
    <div
      className={className}
      css={css`
        width: 100%;
        height: 100%;
        background: ${color};
      `}
    ></div>
  );
};
