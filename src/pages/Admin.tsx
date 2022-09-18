import { css } from '@emotion/core';
import React from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';
import { AdminImageSafeCheck } from '../components';
import { Button } from 'antd';

/** 管理员页面的属性接口 */
interface AdminProps {}
/**
 * 管理员页面
 */
const Admin: FC<AdminProps> = () => {
  const history = useHistory(); // 路由
  const { path, url } = useRouteMatch();
  useTitle(); // 设置标题

  return (
    <div css={css``}>
      <Switch>
        <Route path={`${path}/`} exact>
          <div>
            <Button
              onClick={() => {
                history.push(`${url}/image-check`);
              }}
            >
              图片检查
            </Button>
          </div>
        </Route>
        <Route path={`${path}/image-check`}>
          <AdminImageSafeCheck />
        </Route>
      </Switch>
    </div>
  );
};
export default Admin;
