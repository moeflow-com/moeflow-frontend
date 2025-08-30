import { css } from '@emotion/core';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import {
  Content,
  ContentItem,
  ContentTitle,
  DashboardBox,
  Icon,
  ListItem,
  ProjectSetCreateForm,
  ProjectSetList,
  Tooltip,
} from '../components';
import { Spin } from '../components';
import { TEAM_PERMISSION } from '../constants';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { setCurrentTeamSaga } from '../store/team/slice';
import style from '../style';
import { useTitle } from '../hooks';
import { can } from '../utils/user';
import ProjectSet from './ProjectSet';
import ProjectSetSetting from './ProjectSetSetting';

/** 团队页的属性接口 */
interface TeamProps {}
/**
 * 团队页
 */
const Team: FC<TeamProps> = () => {
  const history = useHistory(); // 路由
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const dispatch = useDispatch();
  const { teamID } = useParams() as { teamID: string };
  const { path, url } = useRouteMatch();
  const currentTeam = useSelector((state: AppState) => state.team.currentTeam);

  // 设置当前目标 team
  useEffect(() => {
    if (teamID !== currentTeam?.id) {
      dispatch(setCurrentTeamSaga({ id: teamID }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamID]);

  const rightButton = (
    <Tooltip
      title={formatMessage({ id: 'projectSet.createProjectSet' })}
      placement="right"
    >
      <div className="ListItem__RightButton">
        <Icon className="ListItem__RightButtonIcon" icon="plus"></Icon>
      </div>
    </Tooltip>
  );

  const handleRightButtonClick = () => {
    history.push(`${url}/create-project-set`);
  };

  return (
    <div
      css={css`
        height: 100%;
        flex: auto;
        display: flex;
        .Team__List {
          flex: none;
          display: flex;
          flex-direction: column;
          width: 200px;
          border-right: 1px solid ${style.borderColorLight};
          .Team__ListItemTitle {
            align-items: center;
            .ListItem__Top {
              color: ${style.primaryColor};
              .ListItem__TopLeft {
                .ListItem__Logo {
                  width: 16px;
                  .ListItem__LogoBoxIcon {
                    width: 16px;
                    height: 16px;
                  }
                }
                .ListItem__Name {
                  font-size: 13px;
                  font-weight: bold;
                }
              }
              .ListItem__RightButton {
                .ListItem__RightButtonIcon {
                  color: ${style.primaryColor};
                }
              }
            }
          }
        }
        ${isMobile &&
        // 手机版适配
        css`
          .Team__List {
            width: 100%;
          }
        `}
      `}
    >
      {currentTeam ? (
        <>
          {!isMobile && (
            <div className="Team__List">
              <ListItem
                disabled={true}
                className="Team__ListItemTitle"
                logo={
                  !isMobile && (
                    <Icon
                      className="ListItem__LogoBoxIcon"
                      icon="box"
                      style={{ height: '14px', width: '14px' }}
                    ></Icon>
                  )
                }
                name={formatMessage({ id: 'site.projectSet' })}
                rightButton={
                  can(currentTeam, TEAM_PERMISSION.CREATE_PROJECT_SET) &&
                  rightButton
                }
                onRightButtonClick={handleRightButtonClick}
              />
              <ProjectSetList className="Team__ProjectSetList" />
            </div>
          )}
          <DashboardBox
            content={
              <Switch>
                {isMobile && (
                  <Route exact path={`${path}`}>
                    <ProjectSetList
                      className="Team__ProjectSetList"
                      searchRightButton={
                        can(currentTeam, TEAM_PERMISSION.CREATE_PROJECT_SET) &&
                        rightButton
                      }
                      onSearchRightButtonClick={handleRightButtonClick}
                    />
                  </Route>
                )}
                <Route path={`${path}/create-project-set`}>
                  <Content
                    css={css`
                      width: 100%;
                      max-width: ${style.contentMaxWidth}px;
                      padding: ${style.paddingBase}px;
                    `}
                  >
                    <ContentTitle>
                      {formatMessage({ id: 'projectSet.createProjectSet' })}
                    </ContentTitle>
                    <ContentItem>
                      <ProjectSetCreateForm teamID={currentTeam.id} />
                    </ContentItem>
                  </Content>
                </Route>
                <Route path={`${path}/project-sets/:projectSetID/setting`}>
                  <ProjectSetSetting />
                </Route>
                <Route path={`${path}/project-sets/:projectSetID`}>
                  <div
                    css={css`
                      width: 100%;
                      height: 100%;
                      display: flex;
                      justify-content: stretch;
                      align-items: stretch;
                    `}
                  >
                    <ProjectSet />
                  </div>
                </Route>
              </Switch>
            }
          ></DashboardBox>
        </>
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
      )}
    </div>
  );
};
export default Team;
