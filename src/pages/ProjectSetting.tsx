import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import {
  ApplicationList,
  DashboardBox,
  InvitationList,
  MemberList,
  NavTab,
  NavTabs,
  ProjectFinishedTip,
  ProjectSettingBase,
  ProjectSettingTarget,
  Spin,
} from '../components';
import { PROJECT_PERMISSION, PROJECT_STATUS } from '../constants';
import { useTitle } from '../hooks';
import { FC, Project } from '../interfaces';
import { AppState } from '../store';
import { can } from '../utils/user';

/** 团队设置页的属性接口 */
interface ProjectSettingProps {
  project?: Project;
}
/**
 * 团队设置页
 */
const ProjectSetting: FC<ProjectSettingProps> = ({ project }) => {
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题
  const { path, url } = useRouteMatch();
  const platform = useSelector((state: AppState) => state.site.platform);
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );
  const isMobile = platform === 'mobile';

  const nav = currentProject && (
    <NavTabs>
      <NavTab to={`${url}/base`}>
        {formatMessage({ id: 'site.baseSetting' })}
      </NavTab>
      <NavTab to={`${url}/member`}>
        {formatMessage({ id: 'site.memberSetting' })}
      </NavTab>
      {can(currentProject, PROJECT_PERMISSION.CHECK_USER) && (
        <NavTab to={`${url}/application`}>
          {formatMessage({ id: 'site.applicationSetting' })}
        </NavTab>
      )}
      {can(currentProject, PROJECT_PERMISSION.INVITE_USER) && (
        <NavTab to={`${url}/invitation`}>
          {formatMessage({ id: 'site.invitationSetting' })}
        </NavTab>
      )}
      <NavTab to={`${url}/target`}>
        {formatMessage({ id: 'project.targetSetting' })}
      </NavTab>
      {/* <NavTab to={`${url}/role`}>
        {formatMessage({ id: 'site.roleSetting' })}
      </NavTab> */}
    </NavTabs>
  );

  // 项目已完结返回提示
  if (currentProject?.status === PROJECT_STATUS.FINISHED) {
    return <ProjectFinishedTip />;
  }

  return currentProject ? (
    <DashboardBox
      // PC 版显示导航
      nav={!isMobile && nav}
      content={
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
            <ProjectSettingBase />
          </Route>
          <Route path={`${path}/member`}>
            <MemberList groupType="project" currentGroup={currentProject} />
          </Route>
          <Route path={`${path}/application`}>
            <ApplicationList
              type="group"
              groupType="project"
              currentGroup={currentProject}
            />
          </Route>
          <Route path={`${path}/invitation`}>
            <InvitationList groupType="project" currentGroup={currentProject} />
          </Route>
          <Route path={`${path}/target`}>
            <ProjectSettingTarget />
          </Route>
          <Route path={`${path}/role`}>自定义角色【施工中】</Route>
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
export default ProjectSetting;
