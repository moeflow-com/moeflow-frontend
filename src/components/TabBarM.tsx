import { css } from '@emotion/core';
import { TabBar } from 'antd-mobile';
import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { Icon } from '.';
import { FC } from '../interfaces';
import { AppState } from '../store';
import style from '../style';

/** 手机版首页底部 TabBar 的属性接口 */
interface TabBarProps {
  className?: string;
}
/**
 * 手机版首页底部 TabBar
 */
export const TabBarM: FC<TabBarProps> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n
  const history = useHistory(); // 路由
  const location = useLocation();
  const newInvitationsCount = useSelector(
    (state: AppState) => state.site.newInvitationsCount
  );
  const relatedApplicationsCount = useSelector(
    (state: AppState) => state.site.relatedApplicationsCount
  );

  const checkActive = ({
    path,
    exact = false,
    strict = false,
  }: {
    path: string;
    exact?: boolean;
    strict?: boolean;
  }) => {
    const active =
      matchPath(location.pathname, {
        path,
        exact,
        strict,
      }) !== null;
    return active;
  };

  return (
    <div
      className={className}
      css={css`
        position: fixed;
        width: 100%;
        bottom: 0;
        background-color: #ffffff;
        padding-bottom: constant(safe-area-inset-bottom); /* iOS 11.0 */
        padding-bottom: env(safe-area-inset-bottom); /* iOS 11.2 */
        .tab-icon {
          width: 18px;
          height: 18px;
        }
      `}
    >
      <TabBar
        unselectedTintColor={style.textColorSecondary}
        tintColor={style.primaryColor}
        barTintColor="white"
        noRenderContent
      >
        <TabBar.Item
          title={formatMessage({ id: 'site.project' })}
          key="myProjects"
          icon={<Icon className="tab-icon" icon="book"></Icon>}
          selectedIcon={<Icon className="tab-icon" icon="book"></Icon>}
          selected={checkActive({ path: '/dashboard/projects' })}
          onPress={() => {
            history.replace('/dashboard/projects');
          }}
        ></TabBar.Item>
        <TabBar.Item
          icon={<Icon className="tab-icon" icon="home"></Icon>}
          selectedIcon={<Icon className="tab-icon" icon="home"></Icon>}
          title={formatMessage({ id: 'site.team' })}
          key="teams"
          selected={checkActive({ path: '/dashboard/teams', exact: true })}
          onPress={() => {
            history.replace('/dashboard/teams');
          }}
        ></TabBar.Item>
        <TabBar.Item
          icon={<Icon className="tab-icon" icon="user-circle"></Icon>}
          selectedIcon={<Icon className="tab-icon" icon="user-circle"></Icon>}
          title={formatMessage({ id: 'site.me' })}
          key="me"
          selected={checkActive({ path: '/dashboard/me' })}
          onPress={() => {
            history.replace('/dashboard/me');
          }}
          dot={newInvitationsCount > 0 || relatedApplicationsCount > 0}
        ></TabBar.Item>
      </TabBar>
    </div>
  );
};
