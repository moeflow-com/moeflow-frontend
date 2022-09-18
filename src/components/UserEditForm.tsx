import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Form, FormItem } from '.';
import api from '../apis';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { setUserInfo } from '../store/user/slice';
import { toLowerCamelCase } from '../utils';
import { USER_NAME_REGEX } from '../utils/regex';

/** 修改项目表单的属性接口 */
interface UserEditFormProps {
  className?: string;
}
/**
 * 修改项目表单
 * 从 redux 的 currentProject 中读取值，使用前必须先
 * dispatch(setCurrentProject({ id }));
 */
export const UserEditForm: FC<UserEditFormProps> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n
  const [form] = AntdForm.useForm();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const user = useSelector((state: AppState) => state.user);

  const handleFinish = (values: any) => {
    setSubmitting(true);
    api
      .editUser({ data: values })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        // 修改成功
        dispatch(setUserInfo(data.user));
        // 弹出提示
        message.success(data.message);
      })
      .catch((error) => {
        error.default(form);
      })
      .finally(() => setSubmitting(false));
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
      <Form
        form={form}
        onFinish={handleFinish}
        hideRequiredMark
        initialValues={{ ...user, locale: user.locale.id }}
      >
        <FormItem
          name="name"
          label={formatMessage({ id: 'user.name' })}
          rules={[
            { required: true },
            {
              pattern: USER_NAME_REGEX,
              message: formatMessage({ id: 'auth.userNameFormatTip' }),
            },
            { min: 2 },
            { max: 18 },
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          name="signature"
          label={formatMessage({ id: 'user.signature' })}
          rules={[{ min: 0 }, { max: 140 }]}
        >
          <Input.TextArea />
        </FormItem>
        <FormItem name="locale" style={{ display: 'none' }}>
          <Input />
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
