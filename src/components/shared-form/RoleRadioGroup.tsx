import { css, Global } from '@emotion/core';
import { Button, Tag } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Icon, Tooltip, TypeRadioGroup } from '@/components';
import { GroupTypes } from '@/apis/type';
import { FC } from '@/interfaces';
import { TypeRadioGroupProps } from './TypeRadioGroup';

export interface RoleData {
  id: string;
  name: string;
  system_code: string;
  permissions: [{ id: string; name: string; intro: string }];
}
/** 默认角色单选组的属性接口 */
interface RoleRadioGroupProps extends Omit<TypeRadioGroupProps, 'typeName'> {
  groupType: GroupTypes;
}
/**
 * 默认角色单选组
 */
export const RoleRadioGroup: FC<RoleRadioGroupProps> = ({
  groupType,
  onChange,
  value,
  className,
  ...radioGroupProps
}) => {
  const { formatMessage } = useIntl(); // i18n
  const [permissionsVisible, setPermissionsVisible] = useState(false);
  const [defaultRole, setDefaultRole] = useState<RoleData>();

  const handleTypeChange = (type: RoleData) => {
    setDefaultRole(type);
  };

  return (
    <div
      className={className}
      css={css`
        width: 100%;
        display: flex;
        flex-direction: column;
        .radio-group {
          width: 100%;
          white-space: pre-wrap;
        }
        .permissions-toggle {
          border-top-width: 1.02px;
          .icon {
            margin-left: 4px;
          }
        }
        .permissions {
          margin-top: 8px;
        }
      `}
    >
      <Global
        styles={css`
          .permission-tag-tooltip {
            pointer-events: none;
            .ant-tooltip-inner {
              font-size: 13px;
              max-width: 215px;
            }
          }
        `}
      />
      <TypeRadioGroup
        typeName="systemRole"
        groupType={groupType}
        onChange={onChange}
        onTypeChange={handleTypeChange}
        value={value}
        {...radioGroupProps}
      >
        {defaultRole && (
          <Button
            className="permissions-toggle"
            type="link"
            onClick={() => {
              setPermissionsVisible((x) => !x); // 显示/隐藏权限
            }}
          >
            {formatMessage({ id: 'site.permission' })}{' '}
            <Icon
              icon={permissionsVisible ? 'caret-up' : 'caret-down'}
              className="icon"
            />
          </Button>
        )}
      </TypeRadioGroup>
      {permissionsVisible && (
        <div className="permissions">
          {defaultRole?.permissions.map((x) => {
            return (
              <Tooltip
                overlayClassName="permission-tag-tooltip"
                title={x.intro}
                key={x.id}
              >
                <Tag>{x.name}</Tag>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
};
