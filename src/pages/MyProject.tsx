import { css } from '@emotion/core';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import {
  DashboardBox,
  Icon,
  ListItem,
  ProjectList,
  TabBarM,
  Tooltip,
} from '../components';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { clearCurrentProjectSet } from '../store/projectSet/slice';
import { clearCurrentTeam } from '../store/team/slice';
import style from '../style';
import Project from './Project';

/** 我参与的项目的属性接口 */
interface MyProjectProps {}
/**
 * 我参与的项目
 */
const MyProject: FC<MyProjectProps> = () => {
  const history = useHistory(); // 路由
  const location = useLocation();
  const { path, url } = useRouteMatch();
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();
  useTitle(); // 设置标题
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const projectList = (
    <div className="MyProject__List">
      <ListItem
        disabled={true}
        className="MyProject__ListItemTitle"
        logo={
          !isMobile && (
            <Icon
              className="ListItem__LogoBoxIcon"
              icon="book"
              style={{ height: '14px', width: '14px' }}
            ></Icon>
          )
        }
        name={formatMessage({ id: 'site.myProjects' })}
        rightButton={
          <Tooltip
            title={formatMessage({ id: 'site.joinProject' })}
            placement="right"
          >
            <div className="ListItem__RightButton">
              <Icon className="ListItem__RightButtonIcon" icon="plus"></Icon>
            </div>
          </Tooltip>
        }
        onRightButtonClick={() => {
          history.push('/dashboard/new-project');
        }}
      />
      <ProjectList className="MyProject__ProjectList" from="user" />
    </div>
  );

  useEffect(() => {
    // 我的项目页面没有这些
    dispatch(clearCurrentProjectSet());
    dispatch(clearCurrentTeam());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="MyProject"
      css={css`
        height: 100%;
        width: 100%;
        flex: auto;
        display: flex;
        .MyProject__List {
          flex: none;
          display: flex;
          flex-direction: column;
          width: 260px;
          overflow: hidden;
          border-right: 1px solid ${style.borderColorLight};
          .List__SearchInputWrapper {
            padding-bottom: 10px !important;
          }
          .MyProject__ListItemTitle {
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
          .MyProject__List {
            width: 100%;
            height: auto;
            flex: auto;
            border-right: none;
          }
        `}
      `}
    >
      {/* 手机版单独为一个 Route 放在下面的 Switch 里 */}
      {!isMobile && projectList}
      <DashboardBox
        content={
          <Switch>
            {isMobile && (
              <Route exact path={`${path}`}>
                {projectList}
              </Route>
            )}
            <Route path={`${path}/:projectID`}>
              <Project />
            </Route>
          </Switch>
        }
      />
      {location.pathname === url && isMobile && (
        // 手机版显示 TabBar
        <TabBarM />
      )}
    </div>
  );
};
export default MyProject;
