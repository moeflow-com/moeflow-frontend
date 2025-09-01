import { css, Global } from '@emotion/core';
import { Icon } from '@/components';
import { Button } from 'antd';
import { FormProps } from 'antd/lib/form';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { AuthLoginedTip } from './AuthLoginedTip';
import mascot from '@/images/brand/mascot-jump1.png';
import { AppState } from '@/store';
import style from '@/style';
import { FC } from '@/interfaces';

/** 身份验证页面通用的表单外框的属性接口 */
interface AuthFormWrapperProps {
  title: string;
  navTip?: string;
  navLink?: 'back' | string;
  className?: string;
}
/**
 * 身份验证页面通用的表单外框
 * @param title 标题
 * @param navTip 标题右侧跳转连接内容
 * @param navLink 标题右侧跳转连接地址
 * @param children 中心区域的内容
 */
export const AuthFormWrapper: FC<AuthFormWrapperProps & FormProps> = ({
  title,
  navTip,
  navLink,
  className,
  children,
}) => {
  const history = useHistory();
  const platform = useSelector((state: AppState) => state.site.platform);
  const token = useSelector((state: AppState) => state.user.token);
  const isMobile = platform === 'mobile';

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
        className={classNames([className, { mobile: isMobile }])}
        css={css`
          flex: 1 0 auto;
          width: 100%;
          background-image: url(${mascot});
          background-position: right bottom;
          background-repeat: no-repeat;
          background-size: 25%;
          display: flex;
          justify-content: center;
          align-items: center;
          .form {
            width: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            user-select: none;
            .title {
              position: relative;
              margin-bottom: 80px;
              text-align: center;
              font-size: 45px;
              line-height: 1;
              color: ${style.primaryColor};
              font-weight: bold;
              .nav-link {
                position: absolute;
                padding: 0;
                left: calc(100% + 40px);
                bottom: 0;
                font-size: 16px;
                line-height: 1;
                font-weight: normal;
                white-space: nowrap;
                height: auto;
                cursor: pointer;
                .angle-double-right {
                  margin-left: 5px;
                }
              }
            }
            .content {
              width: 100%;
              .input {
                margin-bottom: 16px;
              }
            }
          }
          &.mobile {
            /* height: auto; */
            .form {
              .title {
                margin-bottom: 24px;
                .nav-link {
                  position: relative;
                  left: auto;
                  bottom: auto;
                  display: block;
                  margin: 24px auto 0 auto;
                }
              }
            }
          }
        `}
      >
        {token && <AuthLoginedTip />}
        <div className="form" style={{ display: token ? 'none' : 'flex' }}>
          <div className="title">
            {title}
            {navTip && navLink && (
              <Button
                type="link"
                className="nav-link"
                onClick={() => {
                  if (navLink === 'back') {
                    history.goBack();
                  } else {
                    history.push(navLink);
                  }
                }}
              >
                {navTip}
                <Icon
                  className="angle-double-right"
                  icon="angle-double-right"
                />
              </Button>
            )}
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
    </>
  );
};
