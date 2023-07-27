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
  ProjectCreateForm,
  ProjectImportForm,
  ProjectList,
  Spin,
  Tooltip,
} from '../components';
import { TEAM_PERMISSION } from '../constants';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { setCurrentProjectSetSaga } from '../store/projectSet/slice';
import style from '../style';
import { can } from '../utils/user';
import Project from './Project';

/** 项目集页的属性接口 */
interface ProjectSetProps {}
/**
 * 项目集页
 */
const ProjectSet: FC<ProjectSetProps> = () => {
  const history = useHistory(); // 路由
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const dispatch = useDispatch();
  const { projectSetID } = useParams() as { projectSetID: string };
  const { path, url } = useRouteMatch();
  const currentProjectSet = useSelector(
    (state: AppState) => state.projectSet.currentProjectSet
  );
  const currentTeam = useSelector((state: AppState) => state.team.currentTeam);

  // 设置当前 projectSet
  useEffect(() => {
    if (projectSetID !== currentProjectSet?.id) {
      dispatch(setCurrentProjectSetSaga({ id: projectSetID }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectSetID]);

  const rightButton = (
    <Tooltip
      title={formatMessage({ id: 'site.createProject' })}
      placement="right"
    >
      <div className="ListItem__RightButton">
        <Icon className="ListItem__RightButtonIcon" icon="plus"></Icon>
      </div>
    </Tooltip>
  );

  const handleRightButtonClick = () => {
    history.push(`${url}/create-project`);
  };

  return (
    <div
      css={css`
        height: 100%;
        width: 100%;
        flex: auto;
        display: flex;
        .ProjectSet__List {
          flex: none;
          display: flex;
          flex-direction: column;
          width: 260px;
          border-right: 1px solid ${style.borderColorLight};
          .ProjectSet__ListItemTitle {
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
          .ProjectSet__List {
            width: 100%;
          }
        `}
      `}
    >
      {currentTeam && currentProjectSet ? (
        <>
          {/* 手机版单独为一个 Route 放在下面的 Switch 里 */}
          {!isMobile && (
            <div className="ProjectSet__List">
              <ListItem
                disabled={true}
                className="ProjectSet__ListItemTitle"
                logo={
                  !isMobile && (
                    <Icon
                      className="ListItem__LogoBoxIcon"
                      icon="book"
                      style={{ height: '14px', width: '14px' }}
                    ></Icon>
                  )
                }
                name={formatMessage({ id: 'site.project' })}
                rightButton={
                  can(currentTeam, TEAM_PERMISSION.CREATE_PROJECT) &&
                  rightButton
                }
                onRightButtonClick={handleRightButtonClick}
              />
              <ProjectList className="ProjectSet__ProjectList" from="team" />
            </div>
          )}
          <DashboardBox
            content={
              <Switch>
                {isMobile && (
                  <Route exact path={`${path}`}>
                    <ProjectList
                      className="ProjectSet__ProjectList"
                      searchRightButton={
                        can(currentTeam, TEAM_PERMISSION.CREATE_PROJECT) &&
                        rightButton
                      }
                      onSearchRightButtonClick={handleRightButtonClick}
                      from="team"
                    />
                  </Route>
                )}
                <Route path={`${path}/create-project`}>
                  <Content
                    css={css`
                      width: 100%;
                      max-width: ${style.contentMaxWidth}px;
                      padding: ${style.paddingBase}px;
                    `}
                  >
                    <ContentTitle>
                      {formatMessage({ id: 'site.createProject' })}
                    </ContentTitle>
                    <ContentItem>
                      <ProjectCreateForm
                        teamID={currentTeam.id}
                        projectSetID={currentProjectSet.id}
                      />
                    </ContentItem>
                    <ContentTitle
                      css={css`
                        margin-top: 20px;
                        padding-top: 20px;
                        border-top: 1px solid ${style.borderColorBase};
                      `}
                    >
                      {formatMessage({ id: 'site.importProject' })}
                    </ContentTitle>
                    <ContentItem>
                      <ProjectImportForm
                        teamID={currentTeam.id}
                        projectSetID={currentProjectSet.id}
                      />
                    </ContentItem>
                  </Content>
                </Route>
                <Route path={`${path}/projects/:projectID`}>
                  <Project />
                </Route>
              </Switch>
            }
          />
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
export default ProjectSet;
