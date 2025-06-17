import { css } from '@emotion/core';
import { MenuProps } from 'antd';
import { Icon } from './icon';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { Avatar } from './Avatar';
import { Dropdown } from './Dropdown';
import { AppState } from '../store';
import { setUserToken } from '../store/user/slice';
import style from '../style';
import { FC } from '../interfaces';
import { clickEffect } from '../utils/style';
import classNames from 'classnames';
import { routes } from '../pages/routes';
import { LocalePicker } from './setting/LocalePicker';

/** 头部的属性接口 */
interface HeaderProps {
  className?: string;
}

const dropDownMenuItemStyle = css`
  width: 150px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * 头部
 */
export const Header: FC<HeaderProps> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const history = useHistory();
  const currentUser = useSelector((state: AppState) => state.user);

  /** 登出 */
  const logout = () => {
    dispatch(setUserToken({ token: '' }));
    history.push('/login');
  };

  const menuProps: MenuProps = {
    items: [
      {
        label: (
          <a css={dropDownMenuItemStyle} href={routes.dashboard.$}>
            {formatMessage({ id: 'site.dashboard' })}
          </a>
        ),
        key: 'site.dashboard',
      },
      {
        label: (
          <a css={dropDownMenuItemStyle} href={routes.dashboard.user.setting}>
            {formatMessage({ id: 'auth.accountSetting' })}
          </a>
        ),
        key: 'auth.accountSetting',
      },
      {
        dashed: true,
        key: 'divider1',
      },
      {
        label: (
          <a css={dropDownMenuItemStyle}>
            {formatMessage({ id: 'auth.logout' })}
          </a>
        ),
        key: 'auth.logout',
        onClick: logout,
      },
    ],
  };

  const githubLink = (
    <a className="login" href="https://github.com/moeflow-com" target="_blank">
      <Icon icon={['fab', 'github']} size="1x" />
    </a>
  );

  return (
    <div
      className={classNames(['Header', className])}
      css={css`
        width: 100%;
        height: ${style.headerHeight}px;
        padding: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .right {
          display: flex;
          flex-direction: row;
          * + * {
            margin-left: 8px;
          }
          .login,
          .register {
            color: #7f7a7a;
            font-size: 20px;
            line-height: 25px;
            padding: 7px 12px;
            border-radius: ${style.borderRadiusBase};
            ${clickEffect()};
          }
          .avatar {
            cursor: pointer;
            transition: box-shadow 100ms;
            &:active {
              filter: brightness(93%);
            }
            &.ant-dropdown-open {
              box-shadow:
                0 1.5px 3px -2px rgba(0, 0, 0, 0.12),
                0 3px 8px 0 rgba(0, 0, 0, 0.08),
                0 4.5px 14px 4px rgba(0, 0, 0, 0.05);
            }
          }
        }
      `}
    >
      <div className="left">
        <a
          className="icon-text"
          href={routes.index}
          css={css`
            height: 44px;
            line-height: 44px;
            padding: 0 12px;
            color: #7f7a7a;
            font-size: 25px;
            font-weight: bold;
            cursor: pointer;
            user-select: none;
          `}
        >
          {formatMessage({ id: 'site.name' })}
        </a>
      </div>
      {currentUser.token ? (
        <div className="right">
          {/*{mitLink}*/}
          <Dropdown
            menu={menuProps}
            placement="bottomRight"
            trigger={isMobile ? ['click'] : ['hover']}
            overlayStyle={{ paddingTop: '4px' }}
          >
            <Avatar
              className="avatar"
              type="user"
              size={44}
              url={currentUser.avatar}
            />
          </Dropdown>
          <LocalePicker />
        </div>
      ) : (
        <div className="right">
          {/*{mitLink}*/}
          <a className="login" href={routes.login}>
            {formatMessage({ id: 'auth.login' })}
          </a>
          <a className="register" href={routes.signUp}>
            {formatMessage({ id: 'auth.register' })}
          </a>
          <LocalePicker />
          {githubLink}
        </div>
      )}
    </div>
  );
};
