import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Button, TabBarM } from '../components';
import style from '../style';
import { Badge } from 'antd';
import { setUserToken } from '../store/user/slice';

/** 用户手机版 Me 的属性接口 */
interface MeMProps {}
/**
 * 用户手机版 Me
 */
const MeM: FC<MeMProps> = () => {
  const history = useHistory(); // 路由
  const location = useLocation();
  const { url } = useRouteMatch();
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const newInvitationsCount = useSelector(
    (state: AppState) => state.site.newInvitationsCount,
  );
  const relatedApplicationsCount = useSelector(
    (state: AppState) => state.site.relatedApplicationsCount,
  );
  const currentUser = useSelector((state: AppState) => state.user);
  const dispatch = useDispatch();

  /** 登出 */
  const logout = () => {
    dispatch(setUserToken({ token: '' }));
    history.push('/login');
  };

  return (
    <div
      css={css`
        height: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: ${style.backgroundColorLight};
        .MeM__AvatarWrapper {
          flex: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 150px;
        }
        .MeM__Button {
          border-top: 1px solid #eee;
          background: #fff;
        }
        .MeM__Button:last-child {
          border-bottom: 1px solid #eee;
          margin-bottom: 45px;
        }
        .MeM__Badge {
          margin-left: 10px;
        }
      `}
    >
      <div className="MeM__AvatarWrapper">
        <Avatar type="user" size={120} url={currentUser.avatar} />
      </div>
      <div className="MeM__Buttons">
        <Button
          className="MeM__Button"
          color={style.textColor}
          onClick={() => {
            history.push('/');
          }}
        >
          {formatMessage({ id: 'site.index' })}
        </Button>
        <Button
          className="MeM__Button"
          color={style.textColor}
          onClick={() => {
            history.push('/dashboard/user/setting');
          }}
        >
          {formatMessage({ id: 'auth.accountSetting' })}
        </Button>
        <Button
          className="MeM__Button"
          color={style.textColor}
          onClick={() => {
            history.push('/dashboard/user/invitations');
          }}
        >
          {formatMessage({ id: 'me.invitation.new' })}
          {newInvitationsCount > 0 && (
            <Badge
              className="MeM__Badge"
              count={newInvitationsCount}
              size="small"
            ></Badge>
          )}
        </Button>
        <Button
          className="MeM__Button"
          color={style.textColor}
          onClick={() => {
            history.push('/dashboard/user/related-applications');
          }}
        >
          {formatMessage({ id: 'me.applicatio.related' })}
          {relatedApplicationsCount > 0 && (
            <Badge
              className="MeM__Badge"
              count={relatedApplicationsCount}
              size="small"
            ></Badge>
          )}
        </Button>
        <Button className="MeM__Button" onClick={logout}>
          {formatMessage({ id: 'auth.logout' })}
        </Button>
      </div>
      {location.pathname === url && isMobile && (
        // 手机版显示 TabBar
        <TabBarM />
      )}
    </div>
  );
};
export default MeM;
