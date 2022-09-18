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
  TeamSettingBase,
  MemberList,
  InvitationList,
  ApplicationList,
  TeamInsightUserList,
  TeamInsightProjectList,
} from '../components';
import { AppState } from '../store';
import { setCurrentTeamSaga } from '../store/team/slice';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';
import { Spin } from '../components';
import { css } from '@emotion/core';
import { can } from '../utils/user';
import { TEAM_PERMISSION } from '../constants';

/** 团队设置页的属性接口 */
interface TeamSettingProps {}
/**
 * 团队设置页
 */
const TeamSetting: FC<TeamSettingProps> = () => {
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题
  const { teamID } = useParams() as { teamID: string };
  const dispatch = useDispatch();
  const { path, url } = useRouteMatch();
  const platform = useSelector((state: AppState) => state.site.platform);
  const currentTeam = useSelector((state: AppState) => state.team.currentTeam);
  const isMobile = platform === 'mobile';

  // 设置当前目标 team
  useEffect(() => {
    dispatch(setCurrentTeamSaga({ id: teamID }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamID]);

  const nav = currentTeam && (
    <NavTabs>
      <NavTab to={`${url}/base`}>
        {formatMessage({ id: 'site.baseSetting' })}
      </NavTab>
      <NavTab to={`${url}/member`}>
        {formatMessage({ id: 'site.memberSetting' })}
      </NavTab>
      {can(currentTeam, TEAM_PERMISSION.CHECK_USER) && (
        <NavTab to={`${url}/application`}>
          {formatMessage({ id: 'site.applicationSetting' })}
        </NavTab>
      )}
      {can(currentTeam, TEAM_PERMISSION.INVITE_USER) && (
        <NavTab to={`${url}/invitation`}>
          {formatMessage({ id: 'site.invitationSetting' })}
        </NavTab>
      )}
      {can(currentTeam, TEAM_PERMISSION.INSIGHT) && (
        <NavTab to={`${url}/insight-user`}>
          {formatMessage({ id: 'team.userInsight' })}
        </NavTab>
      )}
      {can(currentTeam, TEAM_PERMISSION.INSIGHT) && (
        <NavTab to={`${url}/insight-project`}>
          {formatMessage({ id: 'team.projectInsight' })}
        </NavTab>
      )}
      {/* <NavTab to={`${url}/role`}>
        {formatMessage({ id: 'site.roleSetting' })}
      </NavTab> */}
    </NavTabs>
  );

  return currentTeam ? (
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
            <TeamSettingBase />
          </Route>
          <Route path={`${path}/member`}>
            <MemberList groupType="team" currentGroup={currentTeam} />
          </Route>
          <Route path={`${path}/application`}>
            <ApplicationList
              type="group"
              groupType="team"
              currentGroup={currentTeam}
            />
          </Route>
          <Route path={`${path}/invitation`}>
            <InvitationList groupType="team" currentGroup={currentTeam} />
          </Route>
          <Route path={`${path}/insight-user`}>
            <TeamInsightUserList team={currentTeam} />
          </Route>
          <Route path={`${path}/insight-project`}>
            <TeamInsightProjectList team={currentTeam} />
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
export default TeamSetting;
