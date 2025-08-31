import { css } from '@emotion/core';
import { Dropdown as AntdDropdown } from 'antd';
import { DropDownProps as AntdDropdownProps } from 'antd/lib/dropdown';
import React from 'react';
import { FC } from '../interfaces';

/** 下拉菜单的属性接口 */
interface DropdownProps {
  className?: string;
}
/**
 * 下拉菜单
 */
export const Dropdown: FC<DropdownProps & AntdDropdownProps> = ({
  className,
  children,
  ...dropdownProps
}) => {
  return (
    <AntdDropdown
      className={className}
      css={css``}
      trigger={['click']}
      {...dropdownProps}
    >
      {children}
    </AntdDropdown>
  );
};
