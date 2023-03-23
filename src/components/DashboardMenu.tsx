import { css } from '@emotion/core';
import { Badge, Menu } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { Avatar, Dropdown, Icon, ListItem, TeamList, Tooltip } from '.';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { resetProjectsState } from '../store/project/slice';
import { setUserToken } from '../store/user/slice';
import style from '../style';
import { clickEffect } from '../utils/style';

export const MENU_COLLAPSED_WIDTH = 63;
export const MENU_UNCOLLAPSED_WIDTH = 231;

/** 仪表盘主菜单的属性接口 */
interface DashboardMenuProps {
  collapsed?: boolean;
  rightBottonVisible?: boolean;
  className?: string;
}
/**
 * 仪表盘主菜单
 * @param collapsed 折叠菜单（只显示 icon）
 * @param rightBottonVisible 显示右侧按钮（用于延迟显示，防止 flex 挤压 logo，造成闪动）
 */
export const DashboardMenu: FC<
  DashboardMenuProps &
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >
> = ({
  collapsed = false,
  rightBottonVisible = false,
  className,
  ...divProps
} = {}) => {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const userName = useSelector((state: AppState) => state.user.name);
  const platform = useSelector((state: AppState) => state.site.platform);
  const newInvitationsCount = useSelector(
    (state: AppState) => state.site.newInvitationsCount
  );
  const relatedApplicationsCount = useSelector(
    (state: AppState) => state.site.relatedApplicationsCount
  );
  const isMobile = platform === 'mobile';
  const dispatch = useDispatch();
  const history = useHistory();
  // 收缩大小
  const collapsedWidth = MENU_COLLAPSED_WIDTH - 1;
  const uncollapsedWidth = MENU_UNCOLLAPSED_WIDTH - 1;
  const currentUser = useSelector((state: AppState) => state.user);

  /** 登出 */
  const logout = () => {
    dispatch(setUserToken({ token: '' }));
    history.push('/login');
  };

  const userMenu = (
    <Menu
      css={css`
        .UserMenu__Button {
          margin: 0 auto;
          width: 150px;
          height: 30px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .UserMenu__Badge {
          margin-left: 10px;
        }
      `}
    >
      <Menu.Item onClick={logout}>
        <div className="UserMenu__Button">
          {formatMessage({ id: 'auth.logout' })}
        </div>
      </Menu.Item>
      <Menu.Divider></Menu.Divider>
      <Menu.Item
        onClick={() => {
          history.push('/');
        }}
      >
        <div className="UserMenu__Button">
          {formatMessage({ id: 'site.index' })}
        </div>
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          history.push('/dashboard/user/setting');
        }}
      >
        <div className="UserMenu__Button">
          {formatMessage({ id: 'auth.accountSetting' })}
        </div>
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          history.push('/dashboard/user/invitations');
        }}
      >
        <div className="UserMenu__Button">
          {formatMessage({ id: 'me.invitation.new' })}
          {newInvitationsCount > 0 && (
            <Badge
              className="UserMenu__Badge"
              count={newInvitationsCount}
              size="small"
            ></Badge>
          )}
        </div>
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          history.push('/dashboard/user/related-applications');
        }}
      >
        <div className="UserMenu__Button">
          {formatMessage({ id: 'me.applicatio.related' })}
          {relatedApplicationsCount > 0 && (
            <Badge
              className="UserMenu__Badge"
              count={relatedApplicationsCount}
              size="small"
            ></Badge>
          )}
        </div>
      </Menu.Item>
      {currentUser.admin && (
        <Menu.Item
          onClick={() => {
            history.push('/admin');
          }}
        >
          <div className="UserMenu__Button">
            {formatMessage({ id: 'me.adminPage' })}
          </div>
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div
      className={classNames([className, { mobile: isMobile }])}
      css={css`
        flex: auto;
        display: flex;
        flex-direction: column;
        height: 100%;
        width: ${collapsed ? `${collapsedWidth}px` : `${uncollapsedWidth}px`};
        transition: width 150ms, padding-right 150ms;
        ${isMobile &&
        // 手机版适配
        css`
          width: 100%;
        `};
        .Dashboard__ListItem {
          &.Dashboard__MenuOption {
            .ListItem__Top {
              .ListItem__TopLeft {
                .ListItem__Logo {
                  width: 32px;
                  color: ${style.textColorLightest};
                  border: 1px solid ${style.borderColorLight};
                  border-radius: ${style.borderRadiusBase};
                  background-color: #fff;
                }
              }
            }
            ${clickEffect()};
          }
          &.Dashboard__ListItemTitle {
            align-items: center;
            .ListItem__Top {
              color: ${style.primaryColor};
              .ListItem__TopLeft {
                .ListItem__Logo {
                  width: 16px;
                  transition: width 150ms;
                  .ListItem__LogoIcon {
                    width: 16px;
                    height: 16px;
                  }
                }
                .ListItem__Name {
                  font-size: 13px;
                  font-weight: bold;
                }
              }
            }
            .ListItem__RightButton {
              .ListItem__RightButtonIcon {
                color: ${style.primaryColor};
              }
            }
          }
          /* 最底部的用户 */
          &.Dashboard__MenuUserWrapper {
            ${clickEffect()};
            height: 50px;
            border-top: 1px solid ${style.borderColorLight};
            &.ant-dropdown-open {
              background-color: ${style.hoverColor};
            }
            .Dashboard__MenuUser {
              height: 100%;
              .ListItem__Top {
                height: 100%;
                .ListItem__TopLeft {
                  padding-left: 12.5px;
                  .ListItem__Logo {
                    width: 37px;
                    height: 37px;
                    .ListItem__Avatar {
                      flex: none;
                      border: 1px solid ${style.borderColorLight};
                    }
                  }
                  .ListItem__Name {
                    color: ${style.textColorSecondary};
                    font-size: 15px;
                    font-weight: bold;
                  }
                }
              }
            }
          }
        }
        /* 展开时慢慢名称 */
        .Dashboard__ListItem,
        .ListItem {
          .ListItem__Top {
            .ListItem__TopLeft {
              .ListItem__Name {
                transition: opacity 300ms;
                opacity: 1;
              }
            }
          }
        }
        /* 展开时慢慢显示空提示 */
        .Dashboard__TeamList {
          overflow-y: hidden;
          .TeamList__EmptyTip {
            transition: opacity 1s;
            opacity: 1;
          }
        }
        /* 搜索框距离“团队”标题更近 */
        .List__SearchInputWrapper {
          padding-bottom: 10px !important;
          .ListSearchInput {
            &.ant-input-affix-wrapper {
              .ant-input {
                transition: width 150ms;
              }
              .ant-input-suffix {
                transition: margin-left 150ms;
              }
            }
          }
        }
        ${!rightBottonVisible &&
        /* 显示右侧按钮/滚动条（延时 50ms 显示，以免 flex:auto 时候挤压 logo） */
        css`
          .Dashboard__ListItem,
          .ListItem {
            .ListItem__RightButton {
              display: none !important;
            }
          }
          .Dashboard__TeamList {
            overflow-x: hidden;
            overflow-y: hidden;
          }
          .List__Pagination {
            display: none;
          }
        `};
        ${collapsed &&
        /* 收缩状态 */
        css`
          overflow: hidden;
          .Dashboard__ListItem,
          .ListItem {
            .ListItem__Top {
              .ListItem__TopLeft {
                padding-right: 40px;
                .ListItem__Name {
                  transition: opacity 0ms;
                  opacity: 0;
                }
              }
            }
            &.Dashboard__ListItemTitle {
              .ListItem__Top {
                .ListItem__TopLeft {
                  .ListItem__Logo {
                    width: 32px;
                  }
                }
              }
            }
          }
          .Dashboard__TeamList {
            .TeamList__EmptyTip {
              /* 缩小时立即隐藏空提示 */
              transition: opacity 0ms;
              opacity: 0;
            }
            .List__SkeletonItem {
              .ant-skeleton-content {
                /* 缩小时立即隐藏骨架屏的名称部分 */
                transition: opacity 0ms;
                opacity: 0;
              }
            }
          }
          /** 缩小时居中，隐藏关闭按钮 */
          .List__SearchInputWrapper {
            .ListSearchInput {
              .ant-input-group-addon {
                border-radius: ${style.borderRadiusBase};
                overflow: hidden;
              }
              .ant-input-affix-wrapper.ant-input-affix-wrapper-sm {
                width: 0;
                padding: 0;
                .ant-input {
                  transition: width 150ms;
                  width: 0;
                  padding: 0;
                }
                .ant-input-suffix {
                  transition: margin-left 150ms;
                  margin-left: 2px;
                  .ant-input-clear-icon {
                    display: none;
                  }
                  .ant-input-search-icon {
                    padding: 0;
                  }
                }
              }
            }
          }
        `}
      `}
      {...divProps}
    >
      {!isMobile && (
        // 电脑端显示 “我参与的项目”，手机版在 TabBar
        <>
          <ListItem
            disabled={true}
            className="Dashboard__ListItem Dashboard__ListItemTitle Dashboard__ListItemTitle-top"
            logo={<Icon className="ListItem__LogoIcon" icon="bars"></Icon>}
            name={formatMessage({ id: 'site.dashboard' })}
          />
          <ListItem
            onClick={() => {
              dispatch(resetProjectsState());
              history.push('/dashboard/projects');
            }}
            active={
              matchPath(location.pathname, {
                path: '/dashboard/projects',
              }) !== null
            }
            className="Dashboard__ListItem Dashboard__MenuOption Dashboard__MenuOption--system"
            logo={<Icon className="ListItem__LogoIcon" icon="book"></Icon>}
            name={formatMessage({ id: 'site.myProjects' })}
          />
        </>
      )}
      <ListItem
        disabled={true}
        className="Dashboard__ListItem Dashboard__ListItemTitle"
        logo={
          !isMobile && <Icon className="ListItem__LogoIcon" icon="home"></Icon>
        }
        name={formatMessage({ id: 'site.team' })}
        rightButton={
          <Tooltip
            title={formatMessage({ id: 'site.joinOrCreateTeam' })}
            placement="right"
          >
            <div className="ListItem__RightButton">
              <Icon className="ListItem__RightButtonIcon" icon="plus"></Icon>
            </div>
          </Tooltip>
        }
        onRightButtonClick={() => {
          history.push('/dashboard/new-team');
        }}
      />
      <TeamList className="Dashboard__TeamList" />
      {!isMobile && (
        // 电脑端底部显示用户菜单，手机版在 TabBar
        <Dropdown
          overlay={userMenu}
          placement="topRight"
          trigger={isMobile ? ['click'] : ['hover']}
          overlayStyle={{ paddingTop: '4px' }}
        >
          <div className="Dashboard__ListItem Dashboard__MenuUserWrapper">
            <ListItem
              className="Dashboard__MenuUser"
              logo={
                <Avatar
                  className="TeamList__Avatar"
                  size={37}
                  type="user"
                  dot={newInvitationsCount > 0 || relatedApplicationsCount > 0}
                  url={currentUser.avatar}
                />
              }
              name={userName}
            />
          </div>
        </Dropdown>
      )}
    </div>
  );
};
