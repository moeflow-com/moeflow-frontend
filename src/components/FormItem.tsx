import { Form as AntdForm } from 'antd';
import { FormItemProps as AntdFormItemProps } from 'antd/lib/form';
import React from 'react';
import { FC } from '../interfaces';

/** 表单的属性接口 */
interface FormItemProps {}
/**
 * 表单
 * 自定义的行为：
 * - 当值变动时消除错误
 */
export const FormItem: FC<FormItemProps & AntdFormItemProps> = ({
  ...props
}) => {
  return <AntdForm.Item validateTrigger="onBlur" {...props}></AntdForm.Item>;
};
