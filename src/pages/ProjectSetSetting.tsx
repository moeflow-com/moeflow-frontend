import { css } from '@emotion/core';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import {
  DashboardBox,
  NavTab,
  NavTabs,
  ProjectSetSettingBase,
} from '@/components';
import { Spin } from '@/components';
import { FC } from '@/interfaces';
import { AppState } from '@/store';
import { setCurrentProjectSetSaga } from '@/store/projectSet/slice';
import { useTitle } from '@/hooks';

/** 项目集设置页的属性接口 */
interface ProjectSetSettingProps {}
/**
 * 项目集设置页
 */
const ProjectSetSetting: FC<ProjectSetSettingProps> = () => {
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题
  const { projectSetID } = useParams() as { projectSetID: string };
  const dispatch = useDispatch();
  const { path, url } = useRouteMatch();
  const platform = useSelector((state: AppState) => state.site.platform);
  const currentProjectSet = useSelector(
    (state: AppState) => state.projectSet.currentProjectSet,
  );
  const isMobile = platform === 'mobile';

  // 设置当前目标 projectSet
  useEffect(() => {
    dispatch(setCurrentProjectSetSaga({ id: projectSetID }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSetID]);

  const nav = currentProjectSet && (
    <NavTabs>
      <NavTab to={`${url}/base`}>
        {formatMessage({ id: 'projectSet.baseSetting' })}
      </NavTab>
    </NavTabs>
  );

  return currentProjectSet ? (
    <DashboardBox
      // PC 版显示导航
      nav={!isMobile && nav}
      content={
        <Switch>
          {/* 自动跳转到第一个导航 */}
          <Redirect exact from={`${path}`} to={`${path}/base`} />
          <Route path={`${path}/base`}>
            <ProjectSetSettingBase />
          </Route>
        </Switch>
      }
    />
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
  );
};
export default ProjectSetSetting;
