import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Form, FormItem } from '.';
import api from '../apis';
import { FC } from '../interfaces';
import { setUserToken } from '../store/user/slice';
import { toLowerCamelCase } from '../utils';

/** 修改项目表单的属性接口 */
interface UserPasswordEditFormProps {
  className?: string;
}
/**
 * 修改项目表单
 * 从 redux 的 currentProject 中读取值，使用前必须先
 * dispatch(setCurrentProject({ id }));
 */
export const UserPasswordEditForm: FC<UserPasswordEditFormProps> = ({
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const [form] = AntdForm.useForm();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();

  const handleFinish = (values: any) => {
    setSubmitting(true);
    api
      .editUserPassword({ data: values })
      .then((result) => {
        setSubmitting(false);
        const data = toLowerCamelCase(result.data);
        // 清空表单
        form.resetFields();
        dispatch(setUserToken({ token: '' }));
        history.push('/login');
        // 弹出提示
        message.success(data.message);
      })
      .catch((error) => {
        error.default(form);
        setSubmitting(false);
      });
  };

  return (
    <div
      className={className}
      css={css`
        width: 100%;
        .ant-form-item:last-child {
          margin-bottom: 0;
        }
      `}
    >
      <Form form={form} onFinish={handleFinish} hideRequiredMark>
        <FormItem
          name="oldPassword"
          label={formatMessage({ id: 'site.oldPassword' })}
          rules={[{ required: true }, { min: 6 }, { max: 60 }]}
        >
          <Input.Password />
        </FormItem>
        <FormItem
          name="newPassword"
          label={formatMessage({ id: 'site.newPassword' })}
          rules={[{ required: true }, { min: 6 }, { max: 60 }]}
        >
          <Input.Password />
        </FormItem>
        <FormItem>
          <Button type="primary" block htmlType="submit" loading={submitting}>
            {formatMessage({ id: 'site.save' })}
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};
