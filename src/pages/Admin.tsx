import { css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from 'react-router-dom';
import { useTitle } from '@/hooks';
import { FC } from '@/interfaces';

import { Layout, Menu } from 'antd';
import { useIntl } from 'react-intl';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { AdminImageSafeCheck } from '@/components/admin/AdminImageSafeCheck';
import { AdminSiteSetting } from '@/components/admin/AdminSiteSetting';
import { AdminVCodeList } from '@/components/admin/AdminVCodeList';

const { Sider } = Layout;

/** 管理员页面的属性接口 */
interface AdminProps {}
/**
 * 管理员页面
 */
const Admin: FC<AdminProps> = () => {
  const [collapsed, setCollapsed] = useState(false);
  const history = useHistory(); // 路由
  const { path, url } = useRouteMatch();
  const location = useLocation();
  const defaultSelectedKey =
    location.pathname.split('/')[location.pathname.split('/').length - 1];
  const { formatMessage } = useIntl();

  useTitle(); // 设置标题

  return (
    <div css={css``}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="logo" />
          <Menu
            theme="dark"
            defaultSelectedKeys={[defaultSelectedKey]}
            mode="inline"
          >
            <Menu.Item
              key="dashboard"
              onClick={() => {
                history.push(`/dashboard`);
              }}
            >
              {'<'} {formatMessage({ id: 'admin.backToDashboard' })}
            </Menu.Item>
            <Menu.Item
              key="site-setting"
              onClick={() => {
                history.push(`${url}/site-setting`);
              }}
            >
              {formatMessage({ id: 'admin.siteSettings' })}
            </Menu.Item>
            <Menu.Item
              key="users"
              onClick={() => {
                history.push(`${url}/users`);
              }}
            >
              {formatMessage({ id: 'admin.users' })}
            </Menu.Item>
            <Menu.Item
              key="image-moderation"
              onClick={() => {
                history.push(`${url}/image-moderation`);
              }}
            >
              {formatMessage({ id: 'admin.imageModeration' })}
            </Menu.Item>
            <Menu.Item
              key="site-v-code"
              onClick={() => {
                history.push(`${url}/site-v-code`);
              }}
            >
              {formatMessage({ id: 'admin.captchas' })}
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Switch>
            <Route path={`${path}/`} exact>
              <Redirect to={`${path}/site-setting`} />
            </Route>
            <Route path={`${path}/users`}>
              <AdminUserList />
            </Route>
            <Route path={`${path}/image-moderation`}>
              <AdminImageSafeCheck />
            </Route>
            <Route path={`${path}/site-setting`}>
              <AdminSiteSetting />
            </Route>
            <Route path={`${path}/site-v-code`}>
              <AdminVCodeList />
            </Route>
          </Switch>
        </Layout>
      </Layout>
    </div>
  );
};
export default Admin;
