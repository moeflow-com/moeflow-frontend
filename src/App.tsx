import { css, Global } from '@emotion/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import ImageTranslator from './pages/ImageTranslator';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import { AppState } from './store';
import style from './style';

const App: React.FC = () => {
  const location = useLocation();
  const token = useSelector((state: AppState) => state.user.token);
  const platform = useSelector((state: AppState) => state.site.platform);
  const userIsAdmin = useSelector((state: AppState) => state.user.admin);
  const isMobile = platform === 'mobile';
  // 公共的页面
  const publicPaths = ['/', '/login', '/register', '/reset-password'];

  return (
    <>
      {/* 用于覆盖 antd/antd-mobile 样式 */}
      <Global
        styles={css`
          /* 分页 */

          .ant-pagination-prev,
          .ant-pagination-next {
            padding: 0 10px;
          }

          /* 输入框前缀 */

          .ant-input-prefix {
            margin-left: 4px;
            margin-right: 12px;
            color: #858585;
            font-size: 15px;
            line-height: 25px;
          }

          /** 单选组（因为可能折行，取消圆角） */

          .ant-radio-button-wrapper {
            &:first-of-type {
              border-radius: 0;
            }

            &:last-child {
              border-radius: 0;
            }
          }

          /** 骨架屏 */

          .ant-skeleton {
            .ant-skeleton-avatar.ant-skeleton-avatar-square {
              border-radius: ${style.borderRadiusBase};
            }
          }

          /** 导航栏 */

          .am-navbar {
            .am-navbar-title {
              font-size: 16px;
            }
          }

          /* 抽屉 */

          .ant-drawer-title {
            color: ${style.primaryColor};
            font-size: 16px;
          }

          .ant-badge-dot {
            background-color: ${style.primaryColor};
          }

          .ant-badge-count {
            background-color: ${style.primaryColor};
          }

          /* == 手机版 == */
          ${isMobile &&
          css`
            #root {
              padding-bottom: constant(safe-area-inset-bottom); /* iOS 11.0 */
              padding-bottom: env(safe-area-inset-bottom); /* iOS 11.2 */
            }

            /* 表单 */

            .ant-form {
              .ant-row.ant-form-item {
                .ant-col.ant-form-item-label {
                  padding-bottom: 10px;
                  line-height: 1;

                  label {
                    height: auto;
                  }
                }
              }
            }

            /* 分页 */

            .ant-pagination-prev,
            .ant-pagination-next {
              padding: 0 15px;
            }
          `}
        `}
      />
      {/* 如果没有 token 且访问路径不在公共路径中，则跳转到登陆页面 */}
      {!token && !publicPaths.includes(location.pathname) ? (
        <Redirect to="/login" />
      ) : (
        <Switch>
          {/* 去除 URL 结尾的斜杠 */}
          <Route
            path="/:url*(/+)"
            exact
            strict
            render={({ location }) => (
              <Redirect to={location.pathname.replace(/\/+$/, '')} />
            )}
          />
          {/* 去除 URL 中间的重复斜杠 */}
          <Route
            path="/:url(.*//+.*)"
            exact
            strict
            render={({ match }) => (
              <Redirect to={`/${match.params.url.replace(/\/\/+/, '/')}`} />
            )}
          />
          <Route exact path="/">
            <Index />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/reset-password">
            <ResetPassword />
          </Route>
          <Route path="/image-translator/:fileID-:targetID">
            <ImageTranslator />
          </Route>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          {userIsAdmin && (
            <Route path="/admin">
              <Admin />
            </Route>
          )}
        </Switch>
      )}
    </>
  );
};

export default App;
