import { Form as AntdForm } from 'antd';
import { FormProps as AntdFormProps } from 'antd/lib/form';
import { Store } from 'rc-field-form/es/interface';
import React from 'react';
import { FC } from '../interfaces';

/** 表单的属性接口 */
interface FormProps {}
/**
 * 表单
 * 自定义的行为：
 * - 当值变动时消除错误
 */
export const Form: FC<FormProps & AntdFormProps> = ({ ...props }) => {
  /** 处理 Form 值变动 */
  const handleValuesChange = (changedValues: Store, values: Store) => {
    // 当值变动时消除错误
    for (let key in changedValues) {
      props.form?.setFields([{ name: key, errors: [] }]);
    }
    if (props.onValuesChange) {
      props.onValuesChange(changedValues, values);
    }
  };

  return <AntdForm {...props} onValuesChange={handleValuesChange}></AntdForm>;
};
