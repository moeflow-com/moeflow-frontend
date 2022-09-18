import { css } from '@emotion/core';
import { Select } from 'antd';
import { SelectValue } from 'antd/lib/select';
import classNames from 'classnames';
import React from 'react';
import { TEAM_PERMISSION } from '../constants';
import { FC, Project, Role, UserTeam } from '../interfaces';
import { User } from '../interfaces/user';
import { can } from '../utils/user';

const { Option } = Select;

/** 角色切换器的属性接口 */
interface RoleSelectProps {
  roles?: Role[];
  user: User & { role: Role };
  group: UserTeam | Project;
  onChange?: (user: User, roleID: string) => void;
  className?: string;
}
/**
 * 角色切换器
 */
export const RoleSelect: FC<RoleSelectProps> = ({
  roles,
  user,
  group,
  onChange,
  className,
}) => {
  return (
    <Select
      disabled={
        !roles ||
        user.role.systemCode === 'creator' ||
        !can(group, TEAM_PERMISSION.CHANGE_USER_ROLE) ||
        group.role.level <= user.role.level
      }
      className={classNames('RoleSelect', className)}
      css={css`
        width: 100%;
      `}
      loading={!roles}
      defaultValue={user.role.id}
      value={user.role.id}
      onChange={(roleID: SelectValue) => {
        onChange?.(user, roleID as string);
      }}
    >
      {user.role.systemCode === 'creator' ? ( // 创建人
        <Option value={user.role.id} key={user.role.id}>
          {user.role.name}
        </Option>
      ) : (
        roles?.map((type) => {
          return (
            <Option
              value={type.id}
              key={type.id}
              disabled={group.role.level <= type.level}
            >
              {type.name}
            </Option>
          );
        })
      )}
    </Select>
  );
};
