import { css } from '@emotion/core';
import { Dropdown, MenuProps } from 'antd';
import classNames from 'classnames';
import React, { isValidElement } from 'react';
import { useSelector } from 'react-redux';
import { useMeasure } from 'react-use';
import { Icon } from '@/components';
import { FC } from '@/interfaces';
import { AppState } from '@/store';
import style from '@/style';
import { clickEffect } from '@/utils/style';

/** 标签栏的属性接口 */
interface NavTabsProps {
  className?: string;
}

/**
 * 标签栏
 */
export const NavTabs: FC<NavTabsProps> = ({ className, children }) => {
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const [wrapperRef, { width: wrapperWidth }] = useMeasure<HTMLDivElement>();
  const [ref, { width }] = useMeasure<HTMLDivElement>();

  const menuProps: MenuProps = {
    items: isValidElement(children)
      ? [
          {
            label: children,
            key: 'single',
          },
        ]
      : (children as React.ReactNodeArray).map((child, i) => ({
          label: { child },
          key: i,
        })),
  };

  return (
    <div
      className={classNames('NavTabs', className)}
      css={css`
        display: flex;
        width: 100%;
        border-bottom: 1px solid ${style.borderColorLight};
        position: relative;
        overflow: hidden;
        ${isMobile &&
        css`
          border-bottom: none;
          overflow-y: auto;
        `}
        .NavTabs__Tabs {
          flex: none;
          display: flex;
          justify-content: flex-start;
          align-items: stretch;
          height: 40px;
          line-height: 40px;
          padding: 0 ${style.paddingBase}px;
          /* 手机版变成竖排 */
          ${isMobile &&
          css`
            width: 100%;
            height: auto;
            flex-direction: column;
            padding: 0;
          `}
        }
        .NavTabs__More {
          position: absolute;
          top: 0;
          right: 0;
          width: 40px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: -10px 0px 8px rgba(0, 0, 0, 0.2);
          background-color: #fff;
          ${clickEffect()}
        }
        .ant-dropdown-menu-item > a:hover {
          color: ${style.primaryColor};
        }
      `}
      ref={wrapperRef}
    >
      <div className="NavTabs__Tabs" ref={ref}>
        {children}
      </div>
      {!isMobile && width >= wrapperWidth && (
        <Dropdown
          className="NavTabs__More"
          menu={menuProps}
          placement="bottomRight"
        >
          <div>
            <Icon icon="ellipsis-h" />
          </div>
        </Dropdown>
      )}
    </div>
  );
};
