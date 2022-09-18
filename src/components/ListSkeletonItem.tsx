import { css } from '@emotion/core';
import { Skeleton } from 'antd';
import React from 'react';
import { FC } from '../interfaces';
import style from '../style';
import { listItemStyle } from '../utils/style';

/** 列表元素骨架的属性接口 */
interface ListSkeletonItemProps {
  className?: string;
}
/**
 * 列表元素骨架
 */
export const ListSkeletonItem: FC<ListSkeletonItemProps> = ({ className }) => {
  return (
    <div
      className={className}
      css={css`
        ${listItemStyle()}
        .ant-skeleton {
          .ant-skeleton-header {
            height: 100%;
            padding: 0 10px 0 ${style.paddingBase}px;
          }
          .ant-skeleton-content {
            transition: opacity 300ms;
            opacity: 1;
            .ant-skeleton-title {
              width: 85% !important;
              margin: 8px 0 0 0;
            }
            .ant-skeleton-paragraph {
              display: none;
            }
          }
        }
      `}
    >
      <Skeleton
        active
        avatar={{ size: 32, shape: 'square' }}
        paragraph={{ rows: 0, width: '100%' }}
      />
    </div>
  );
};
