import { css } from '@emotion/core';
import { Icon } from '@/components';
import React from 'react';
import { FC } from '@/interfaces';

/** 用于拖动元素的三条线样的把手的属性接口 */
interface MovableItemBarsProps {
  className?: string;
}
/**
 * 用于拖动元素的三条线样的把手
 */
export const MovableItemBars: FC<MovableItemBarsProps> = ({ className }) => {
  return (
    <div
      className={className}
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 40px;
        height: 40px;
        .icon {
          color: #aaa;
        }
      `}
    >
      <Icon icon="bars" className="icon" />
    </div>
  );
};
