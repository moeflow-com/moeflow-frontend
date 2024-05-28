import { css } from '@emotion/core';
import { Button, Form as AntdForm, type InputRef, message } from 'antd';
import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { EmailVCodeInputItem, Form, FormItem, VCodeInput } from '.';
import api from '../apis';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { setUserInfo } from '../store/user/slice';
import { toLowerCamelCase } from '../utils';

/** 修改项目表单的属性接口 */
interface UserEmailEditFormProps {
  className?: string;
}
/**
 * 修改项目表单
 * 从 redux 的 currentProject 中读取值，使用前必须先
 * dispatch(setCurrentProject({ id }));
 */
export const UserEmailEditForm: FC<UserEmailEditFormProps> = ({
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const [form] = AntdForm.useForm();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const userEmail = useSelector((state: AppState) => state.user.email);

  // 用于输入完人机验证码后自动定位到邮件验证码输入框
  const oldEmailVCodeInputRef = useRef<InputRef>(null);
  const newEmailVCodeInputRef = useRef<InputRef>(null);

  const handleFinish = (values: any) => {
    setSubmitting(true);
    api
      .editUserEmail({ data: values })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        // 修改成功
        dispatch(setUserInfo(data.user));
        // 清空表单
        form.resetFields();
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
        initialValues={{ oldEmail: userEmail }}
      >
        <EmailVCodeInputItem
          vCodeType="resetEmail"
          name="oldEmail"
          onSend={(waiting) => {
            // 发送成功且不在等待中
            if (!waiting) {
              const tip = formatMessage({ id: 'auth.sendEmailSuccessTip' });
              message.success({ content: tip, duration: 6 });
            }
            oldEmailVCodeInputRef.current?.focus();
          }}
          defaultEmail={userEmail}
          label={formatMessage({ id: 'site.oldEmail' })}
          inputProps={{
            disabled: true,
          }}
        ></EmailVCodeInputItem>
        <FormItem
          name="oldEmailVCode"
          rules={[{ required: true }, { len: 6 }]}
          label={formatMessage({ id: 'site.oldEmailVCode' })}
        >
          <VCodeInput maxLength={6} ref={oldEmailVCodeInputRef} />
        </FormItem>
        <EmailVCodeInputItem
          vCodeType="confirmEmail"
          name="newEmail"
          onSend={(waiting) => {
            // 发送成功且不在等待中
            if (!waiting) {
              const tip = formatMessage({ id: 'auth.sendEmailSuccessTip' });
              message.success({ content: tip, duration: 6 });
            }
            newEmailVCodeInputRef.current?.focus();
          }}
          label={formatMessage({ id: 'site.newEmail' })}
        ></EmailVCodeInputItem>
        <FormItem
          name="newEmailVCode"
          rules={[{ required: true }, { len: 6 }]}
          label={formatMessage({ id: 'site.newEmailVCode' })}
        >
          <VCodeInput maxLength={6} ref={newEmailVCodeInputRef} />
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
