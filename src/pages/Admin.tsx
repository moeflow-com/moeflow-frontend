import { css } from '@emotion/core';
import React, { useState } from 'react';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { AdminImageSafeCheck, AdminUserList } from '../components';
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
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item
              key="0"
              onClick={() => {
                history.push(`/dashboard`);
              }}
            >
              {'<'} 返回仪表盘
            </Menu.Item>
            <Menu.Item
              key="1"
              onClick={() => {
                history.push(`${url}/users`);
              }}
            >
              用户管理
            </Menu.Item>
            <Menu.Item
              key="2"
              onClick={() => {
                history.push(`${url}/image-check`);
              }}
            >
              图片检查
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Switch>
            <Route path={`${path}/`} exact>
              <Redirect to={`${path}/users`} />
            </Route>
            <Route path={`${path}/users`}>
              <AdminUserList />
            </Route>
            <Route path={`${path}/image-check`}>
              <AdminImageSafeCheck />
            </Route>
          </Switch>
        </Layout>
      </Layout>
    </div>
  );
};
export default Admin;
