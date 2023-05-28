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
import {
  AdminImageSafeCheck,
  AdminSiteSetting,
  AdminUserList,
  AdminVCodeList,
} from '../components';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';

import { Layout, Menu } from 'antd';

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
          <Menu theme="dark" defaultSelectedKeys={[defaultSelectedKey]} mode="inline">
            <Menu.Item
              key="dashboard"
              onClick={() => {
                history.push(`/dashboard`);
              }}
            >
              {'<'} 返回仪表盘
            </Menu.Item>
            <Menu.Item
              key="site-setting"
              onClick={() => {
                history.push(`${url}/site-setting`);
              }}
            >
              站点管理
            </Menu.Item>
            <Menu.Item
              key="users"
              onClick={() => {
                history.push(`${url}/users`);
              }}
            >
              用户管理
            </Menu.Item>
            <Menu.Item
              key="image-check"
              onClick={() => {
                history.push(`${url}/image-check`);
              }}
            >
              图片检查
            </Menu.Item>
            <Menu.Item
              key="site-v-code"
              onClick={() => {
                history.push(`${url}/site-v-code`);
              }}
            >
              验证码
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
            <Route path={`${path}/image-check`}>
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
