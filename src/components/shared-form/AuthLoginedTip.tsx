import { css } from '@emotion/core';
import { Button } from 'antd';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Avatar } from '@/components';
import { AppState } from '@/store';
import { setUserToken } from '@/store/user/slice';
import style from '@/style';
import { FC } from '@/interfaces';

/** 已经登陆提示的属性接口 */
interface AuthLoginedTipProps {
  className?: string;
}
/**
 * 已经登陆提示
 */
export const AuthLoginedTip: FC<AuthLoginedTipProps> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n
  const userName = useSelector((state: AppState) => state.user.name);
  const dispatch = useDispatch();
  const history = useHistory();
  const currentUser = useSelector((state: AppState) => state.user);

  /** 前往仪表盘 */
  const goDashboard = () => {
    history.push('/dashboard/projects');
  };

  /** 登出 */
  const logout = () => {
    dispatch(setUserToken({ token: '' }));
  };

  return (
    <div
      className={className}
      css={css`
        width: 300px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .avatar {
          margin-bottom: 24px;
        }
        .tip {
          color: ${style.textColorSecondary};
          font-size: 20px;
          margin-bottom: 24px;
        }
        .go-dashboard {
          margin-bottom: 24px;
        }
      `}
    >
      <Avatar
        type="user"
        className="avatar"
        size={120}
        url={currentUser.avatar}
      />
      <div className="tip">
        {formatMessage({ id: 'auth.loginedTip' }, { userName })}
      </div>
      <Button
        onClick={goDashboard}
        className="go-dashboard"
        size="large"
        type="primary"
        block
      >
        {formatMessage({ id: 'router.goDashboard' })}
      </Button>
      <Button onClick={logout} className="logout" size="large" block>
        {formatMessage({ id: 'auth.logout' })}
      </Button>
    </div>
  );
};
