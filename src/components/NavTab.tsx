import { css } from '@emotion/core';
import React from 'react';
import { FC } from '../interfaces';
import { NavLinkProps, NavLink } from 'react-router-dom';
import style from '../style';
import { clickEffect } from '../utils/style';
import { useSelector } from 'react-redux';
import { AppState } from '../store';
import { Icon } from '.';
import classNames from 'classnames';

/** 带导航的 Tab 的属性接口 */
interface NavTabProps {
  className?: string;
}
/**
 * 带导航的 Tab
 */
export const NavTab: FC<NavLinkProps & NavTabProps> = ({
  className,
  children,
  ...navLinkProps
}) => {
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  // 手机版 push，PC 版 replace
  if (!isMobile) {
    navLinkProps = { replace: true, ...navLinkProps };
  }

  return (
    <NavLink
      className={classNames('NavTab', className)}
      activeClassName={'NavTab--Active'}
      css={css`
        flex: none;
        padding: 0 ${style.paddingBase}px;
        height: 100%;
        color: ${style.textColor};
        position: relative;
        ${clickEffect()};
        .NavTab__Text {
          height: 100%;
          box-sizing: border-box;
        }
        .NavTab__ArrowM {
          display: none;
        }
        &:hover {
          color: ${style.textColor};
        }
        &.NavTab--Active {
          color: ${style.primaryColor};
          font-weight: 500;
          .NavTab__Text {
            border-bottom: 2px solid ${style.primaryColor};
          }
        }
        ${isMobile &&
        css`
          padding-right: 0;
          height: 45px;
          line-height: 45px;
          .NavTab__Text {
            padding-left: ${style.paddingBase}px;
            border-bottom: 1px solid ${style.borderColorLight};
          }
          .NavTab__ArrowM {
            display: block;
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;
            width: 25px;
            color: ${style.textColorSecondary};
          }
          &.NavTab--Active {
            .NavTab__Text {
              border-bottom: none;
            }
          }
        `}
      `}
      {...navLinkProps}
    >
      <div className="NavTab__Text">{children}</div>
      <div className="NavTab__ArrowM">
        <Icon icon="angle-right"></Icon>
      </div>
    </NavLink>
  );
};
