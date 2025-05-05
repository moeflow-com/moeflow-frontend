import { Tooltip as AntdTooltip } from 'antd';
import {
  TooltipPropsWithTitle as AntdTooltipPropsWithTitle,
  TooltipPropsWithOverlay as AntdTooltipPropsWithOverlay,
} from 'antd/lib/tooltip';
import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '@/store';
import { FC } from '@/interfaces';
import { css, Global } from '@emotion/core';
import style from '../style';

/**
 * 手机版自动隐藏的 Tooltip
 */
interface TooltipPropsWithTitle extends AntdTooltipPropsWithTitle {
  disabled?: boolean;
}
interface TooltipPropsWithOverlay extends AntdTooltipPropsWithOverlay {
  disabled?: boolean;
}
export type TooltipProps = TooltipPropsWithTitle | TooltipPropsWithOverlay;
export const Tooltip: FC<TooltipProps> = (
  { disabled, children, ...args } = {} as TooltipProps,
) => {
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';

  if (isMobile || disabled) {
    return <>{children}</>;
  } else {
    return (
      <>
        <Global
          styles={css`
            .Tooltip {
              font-size: 12px;
              line-height: 1.4;
              pointer-events: none;
              user-select: none;
              .ant-tooltip-inner {
                border-radius: ${style.borderRadiusBase};
                min-height: 20px;
              }
            }
          `}
        />
        <AntdTooltip overlayClassName="Tooltip" {...args}>
          {children}
        </AntdTooltip>
      </>
    );
  }
};
