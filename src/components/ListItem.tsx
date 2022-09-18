import { css } from '@emotion/core';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { FC } from '../interfaces';
import style from '../style';
import { clickEffect } from '../utils/style';

export const LIST_ITEM_DEFAULT_HEIGHT = 45;
/** 列表元素的属性接口 */
export interface ListItemProps {
  to?: string;
  replace?: boolean;
  name: React.ReactNode | React.ReactElement;
  logo?: React.ReactNode | React.ReactElement;
  icon?: React.ReactNode | React.ReactElement;
  rightButton?: React.ReactNode | React.ReactElement;
  onClick?: (e: React.MouseEvent) => void;
  onRightButtonClick?: (e: React.MouseEvent) => void;
  content?: React.ReactNode | React.ReactElement;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}
/**
 * 列表元素
 */
export const ListItem: FC<ListItemProps> = ({
  to,
  replace = false,
  logo,
  name,
  icon,
  rightButton,
  onClick,
  onRightButtonClick,
  content,
  active = false,
  disabled = false,
  className,
}) => {
  const history = useHistory(); // 路由
  const location = useLocation();
  const [toActive, setToActive] = useState(false);

  useEffect(() => {
    checkToActive();
  });

  const checkToActive = () => {
    if (to) {
      const active = matchPath(location.pathname, { path: to }) !== null;
      setToActive(active);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // 如果提供了 to，则识别 url 是否 active
    if (to) {
      if (replace) {
        history.replace(to);
      } else {
        history.push(to);
      }
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      className={classNames([
        className,
        'ListItem',
        { 'ListItem--active': to ? toActive : active },
      ])}
      css={css`
        .ListItem__Top {
          flex: none;
          display: flex;
          height: 45px;
          width: 100%;
          align-items: center;
          color: ${style.textColor};
          transition: background-color 150ms;
          .ListItem__TopLeft {
            flex: auto;
            display: flex;
            align-items: center;
            height: 100%;
            padding-left: ${style.paddingBase}px;
            overflow: hidden;
            .ListItem__Logo {
              flex: none;
              margin-right: 10px;
              height: 32px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .ListItem__Name {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              padding-right: ${style.paddingBase}px;
            }
            .ListItem__Icon {
              flex: none;
              margin-left: auto;
              width: 45px;
              height: 45px;
              display: flex;
              justify-content: center;
              align-items: center;
              color: ${style.textColorSecondaryLightest};
            }
            ${!disabled && (onClick || to) && clickEffect()};
            ${rightButton &&
            /* 有右侧按钮时，名称不需要右内间距 */
            css`
              .ListItem__Name {
                padding-right: 0;
              }
            `};
          }
          .ListItem__RightButton {
            color: ${style.textColorSecondary};
            width: 45px;
            height: 45px;
            flex: none;
            margin-left: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            ${onRightButtonClick && clickEffect()};
            color: ${style.textColorSecondaryLightest};
          }
        }
        .ListItem__Content {
          width: 100%;
        }
        &.ListItem--active {
          background-color: ${style.selectedColor};
          .ListItem__RightButton {
            color: ${style.textColorSecondary};
          }
          .ListItem__Top {
            .ListItem__TopLeft {
              .ListItem__Icon {
                color: ${style.textColorSecondary};
              }
            }
          }
        }
      `}
    >
      <div className="ListItem__Top">
        <div className="ListItem__TopLeft" onClick={handleClick}>
          {logo && <div className="ListItem__Logo">{logo}</div>}
          <div className="ListItem__Name">{name}</div>
          {icon && <div className="ListItem__Icon">{icon}</div>}
        </div>
        {rightButton && (
          <div className="ListItem__RightButton" onClick={onRightButtonClick}>
            {rightButton}
          </div>
        )}
      </div>
      <div className="ListItem__Content">{content}</div>
    </div>
  );
};
