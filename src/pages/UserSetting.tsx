import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import {
  DashboardBox,
  NavTab,
  NavTabs,
  Spin,
  UserSettingBase,
  UserSettingSafe,
} from '../components';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { useTitle } from '../hooks';

/** 团队设置页的属性接口 */
interface UserSettingProps {}
/**
 * 团队设置页
 */
const UserSetting: FC<UserSettingProps> = () => {
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题
  const { path, url } = useRouteMatch();
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const user = useSelector((state: AppState) => state.user);

  const nav = (
    <NavTabs>
      <NavTab to={`${url}/base`}>
        {formatMessage({ id: 'site.baseSetting' })}
      </NavTab>
      <NavTab to={`${url}/safe`}>
        {formatMessage({ id: 'site.safeSetting' })}
      </NavTab>
    </NavTabs>
  );

  return (
    <DashboardBox
      // PC 版显示导航
      nav={!isMobile && nav}
      content={
        user.name ? (
          <Switch>
            {isMobile ? (
              // 手机版导航单独为一个页面
              <Route exact path={`${path}`}>
                {nav}
              </Route>
            ) : (
              // PC 版自动跳转到第一个导航
              <Redirect exact from={`${path}`} to={`${path}/base`} />
            )}
            <Route path={`${path}/base`}>
              <UserSettingBase />
            </Route>
            <Route path={`${path}/safe`}>
              <UserSettingSafe />
            </Route>
          </Switch>
        ) : (
          <Spin
            size="large"
            css={css`
              flex: auto;
              display: flex;
              justify-content: center;
              align-items: center;
            `}
          />
        )
      }
    />
  );
};
export default UserSetting;
