import { css, Global } from '@emotion/core';
import { NavBar as NavBarM } from 'antd-mobile';
import { Canceler } from 'axios';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import { api } from '@/apis';
import { ApplicationList, DashboardMenu, Icon, TabBarM } from '../components';
import { UserInvitationList } from '@/components';
import { APPLICATION_STATUS } from '@/constants';
import { INVITATION_STATUS } from '@/constants';
import { FC } from '@/interfaces';
import { AppState } from '@/store';
import {
  setNewInvitationsCount,
  setRelatedApplicationsCount,
} from '@/store/site/slice';
import style from '../style';
import { getCancelToken } from '@/utils/api';
import { useTitle } from '@/hooks';
import JoinGroup from './JoinGroup';
import NewProject from './NewProject';
import NewTeam from './NewTeam';
import MeM from './MeM';
import MyProject from './MyProject';
import Team from './Team';
import TeamSetting from './TeamSetting';
import UserSetting from './UserSetting';
import { MENU_COLLAPSED_WIDTH } from '@/components/dashboard/DashboardMenu';

/** 仪表盘的属性接口 */
interface DashboardProps {}
/**
 * 仪表盘
 */
const Dashboard: FC<DashboardProps> = () => {
  const dispatch = useDispatch();
  const history = useHistory(); // 路由
  const location = useLocation();
  const { formatMessage } = useIntl(); // i18n
  useTitle({ prefix: formatMessage({ id: 'site.dashboard' }) }); // 设置标题
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';

  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const [menuRightButtonVisible, setMenuRightButtonVisible] = useState(false);
  const { path, url } = useRouteMatch();
  const currentUser = useSelector((state: AppState) => state.user);

  // 定时检查是否有新的邀请
  useEffect(() => {
    let lastCancel: Canceler | null;

    const fetchUserInvitationsCount = () => {
      if (lastCancel) {
        return;
      }
      const [cancelToken, cancel] = getCancelToken();
      lastCancel = cancel;
      api.me
        .getUserInvitations({
          params: { limit: 1, status: [INVITATION_STATUS.PENDING] },
          configs: {
            cancelToken,
          },
        })
        .then((result) => {
          // 设置数量
          dispatch(
            setNewInvitationsCount(
              Number(result.headers['x-pagination-count']),
            ),
          );
        })
        .catch((error) => {})
        .finally(() => {
          lastCancel = null;
        });
    };

    fetchUserInvitationsCount();
    const id = setInterval(fetchUserInvitationsCount, 3 * 60 * 1000);
    return () => {
      clearInterval(id);
      lastCancel?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  // 定时检查是否有新的需要审核邀请
  useEffect(() => {
    let lastCancel: Canceler | null;

    const fetchRelatedApplicationsCount = () => {
      if (lastCancel) {
        return;
      }
      const [cancelToken, cancel] = getCancelToken();
      lastCancel = cancel;
      api.me
        .getRelatedApplications({
          params: { limit: 1, status: [APPLICATION_STATUS.PENDING] },
          configs: {
            cancelToken,
          },
        })
        .then((result) => {
          // 设置数量
          dispatch(
            setRelatedApplicationsCount(
              Number(result.headers['x-pagination-count']),
            ),
          );
        })
        .catch((error) => {})
        .finally(() => {
          lastCancel = null;
        });
    };

    fetchRelatedApplicationsCount();
    const id = setInterval(fetchRelatedApplicationsCount, 3 * 60 * 1000);
    return () => {
      clearInterval(id);
      lastCancel?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  /** 是否是手机版 Tab 页 */
  const isMobileTabPage = () => {
    return [
      '/dashboard/projects',
      '/dashboard/teams',
      '/dashboard/me',
    ].includes(location.pathname);
  };

  /** 菜单栏 */
  const menu = (
    <DashboardMenu
      collapsed={isMobile ? false : menuCollapsed}
      rightBottonVisible={isMobile ? true : menuRightButtonVisible}
    />
  );

  /** PC 版可折叠的导航栏 */
  const collapsibleMenu = (
    <div
      className="Dashboard__CollapsibleMenu"
      onMouseEnter={() => {
        setMenuCollapsed(false);
        // 延迟显示右侧按钮，以免 flex 挤压左侧 logo 造成闪烁
        setTimeout(() => {
          setMenuRightButtonVisible(true);
        }, 75);
      }}
      onMouseLeave={() => {
        setMenuCollapsed(true);
        setMenuRightButtonVisible(false);
      }}
    >
      {menu}
    </div>
  );

  return (
    <>
      <Global
        styles={css`
          #root {
            height: 100%;
          }
        `}
      />
      <div
        css={css`
          height: 100%;
          width: 100%;
          .Dashboard__CollapsibleMenu {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            box-sizing: content-box;
            border-right: 1px solid ${style.borderColorLight};
            background: #fff;
            z-index: 100;
            transition: box-shadow 150ms;
          }
          .Dashboard__CollapsibleMenuShade {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 150ms;
            z-index: 99;
            pointer-events: none;
          }
          .Dashboard__Content {
            margin-left: ${MENU_COLLAPSED_WIDTH}px;
            width: calc(100% - ${MENU_COLLAPSED_WIDTH}px);
            height: 100%;
          }
          ${!menuCollapsed &&
          // 菜单展开
          css`
            .Dashboard__CollapsibleMenu {
              box-shadow: 0 0 14px rgba(0, 0, 0, 0.5);
            }
            .Dashboard__CollapsibleMenuShade {
              opacity: 1;
              background-color: rgba(0, 0, 0, 0.3);
            }
          `}
          ${isMobile &&
          // 手机版
          css`
            flex-direction: column;
            .Dashboard__CollapsibleMenu {
              position: relative;
              flex: none;
            }
            .Dashboard__Content {
              margin-left: 0;
              width: 100%;
            }
          `}
          ${isMobile &&
          isMobileTabPage() &&
          // 手机版且在 Tab 页，给底部 TabBar 空出距离
          css`
            height: calc(100% - ${style.tabBarHeightM}px);
            margin-bottom: ${style.tabBarHeightM}px;
          `}
          ${isMobile &&
          !isMobileTabPage() &&
          // 手机版且不在 Tab 页，给顶部导航条空出距离
          css`
            padding-top: ${style.navHeightM}px;
          `}
        `}
      >
        {/* 手机版顶部导航栏（除了 Tab 页） */}
        {isMobile && !isMobileTabPage() && (
          <NavBarM
            css={css`
              position: fixed;
              width: 100%;
              height: ${style.navHeightM}px;
              top: 0;
              left: 0;
              border-bottom: 1px solid ${style.borderColorLight};
              z-index: 100;
            `}
            mode="light"
            icon={<Icon icon="angle-left" />}
            onLeftClick={() => {
              history.goBack();
            }}
            rightContent={<Icon icon="ellipsis-h" />}
          >
            {formatMessage({ id: 'site.dashboard' })}
          </NavBarM>
        )}
        {/* PC 版右侧可折叠的导航栏 */}
        {!isMobile && collapsibleMenu}
        <div className="Dashboard__Content">
          <Switch>
            <Redirect from={`${path}`} to={`${path}/projects`} exact />
            {isMobile && (
              // 手机版我的团队（即menu）单独为一个页面
              <Route path={`${path}/teams`} exact>
                {menu}
              </Route>
            )}
            {/* 主要内容路由 */}
            <Route path={`${path}/projects`}>
              <MyProject />
            </Route>
            <Route path={`${path}/me`}>
              <MeM /> {/* 手机版我的页面 */}
            </Route>
            <Route path={`${path}/user/setting`}>
              <UserSetting />
            </Route>
            <Route path={`${path}/user/invitations`}>
              <UserInvitationList />
            </Route>
            <Route path={`${path}/user/related-applications`}>
              <ApplicationList type="related" />
            </Route>
            <Route path={`${path}/teams/:teamID/setting`}>
              <TeamSetting />
            </Route>
            <Route path={`${path}/teams/:teamID`}>
              <Team />
            </Route>
            <Route path={`${path}/new-team`}>
              <NewTeam />
            </Route>
            <Route path={`${path}/new-project`}>
              <NewProject />
            </Route>
            <Route path={`${path}/join/:groupType/:groupID`}>
              <JoinGroup />
            </Route>
          </Switch>
        </div>
        {isMobile && location.pathname === url + '/teams' && (
          // dashboard 手机版显示 TabBar
          <TabBarM />
        )}
        {!isMobile && <div className="Dashboard__CollapsibleMenuShade"></div>}
      </div>
    </>
  );
};
export default Dashboard;
