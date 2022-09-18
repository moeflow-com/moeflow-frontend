import { Loading3QuartersOutlined } from '@ant-design/icons';
import React from 'react';
import { FC } from '../interfaces';

/** 加载中 Icon 的属性接口 */
interface LoadingIconProps {
  color?: string;
  size?: number;
  className?: string;
}
/**
 * 加载中 Icon
 */
export const LoadingIcon: FC<LoadingIconProps> = ({
  size = 18,
  color = '#ccc',
  className,
} = {}) => {
  return (
    <Loading3QuartersOutlined style={{ fontSize: size, color: color }} spin />
  );
};
