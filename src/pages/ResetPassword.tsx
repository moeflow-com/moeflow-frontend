import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message, Modal } from 'antd';
import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import api, { FailureResults, resultTypes } from '../apis';
import {
  AuthFormWrapper,
  EmailVCodeInputItem,
  Form,
  FormItem,
  Header,
  VCodeInput,
} from '../components';
import { setUserToken } from '../store/user/slice';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';
import { useHistory } from 'react-router-dom';

/** 重置密码页的属性接口 */
interface ResetPasswordProps {}
/**
 * 重置密码页
 */
const ResetPassword: FC<ResetPasswordProps> = () => {
  const { formatMessage } = useIntl(); // i18n
  useTitle({ prefix: formatMessage({ id: 'auth.resetPassword' }) }); // 设置标题
  const dispatch = useDispatch();
  const [form] = AntdForm.useForm();
  const history = useHistory();

  // 用于输入完人机验证码后自动定位到邮件验证码输入框
  const emailVCodeInputRef = useRef<Input>(null);

  /** 提交表单 */
  const handleFinish = (values: any) => {
    api
      .resetPassword({ data: values })
      .then((result) => {
        // 重置表单
        form.resetFields();
        // 询问用户是否记住我
        Modal.confirm({
          title: formatMessage({ id: 'auth.resetSuccessTitle' }),
          content: formatMessage({ id: 'auth.autoLoginTip' }),
          okText: formatMessage({ id: 'auth.rememberMe' }),
          okType: 'primary',
          cancelText: formatMessage({ id: 'form.cancel' }),
          onOk: () => {
            dispatch(
              setUserToken({ token: result.data.token, rememberMe: true }),
            );
            // 跳转到仪表盘
            history.push('/dashboard/projects');
          },
          onCancel: () => {
            dispatch(setUserToken({ token: result.data.token }));
            // 跳转到仪表盘
            history.push('/dashboard/projects');
          },
        });
      })
      .catch((result: FailureResults) => {
        if (result.type === resultTypes.VALIDATION_FAILURE) {
          // 字段验证错误
          result.default(form);
          // 邮箱验证码错误，自动定位
          if (result.data.message.vCode) {
            emailVCodeInputRef.current?.focus();
          }
          return;
        }
        result.default();
      });
  };

  return (
    <div
      css={css`
        min-height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <Header></Header>
      <AuthFormWrapper
        title={formatMessage({ id: 'auth.resetPassword' })}
        navTip={formatMessage({ id: 'auth.back' })}
        navLink="back"
      >
        <Form name="reset-password-form" form={form} onFinish={handleFinish}>
          <EmailVCodeInputItem
            vCodeType="resetPassword"
            onSend={(waiting) => {
              // 发送成功且不在等待中
              if (!waiting) {
                const tip = formatMessage({ id: 'auth.sendEmailSuccessTip' });
                message.success({ content: tip, duration: 6 });
              }
              emailVCodeInputRef.current?.focus();
            }}
            name="email"
            inputProps={{
              prefix: formatMessage({ id: 'site.email' }),
              size: 'large',
            }}
          />
          <FormItem name="vCode" rules={[{ required: true }, { len: 6 }]}>
            <VCodeInput
              maxLength={6}
              ref={emailVCodeInputRef}
              prefix={formatMessage({ id: 'site.vCode' })}
              size="large"
            />
          </FormItem>
          <FormItem
            name="password"
            rules={[{ required: true }, { min: 6 }, { max: 60 }]}
          >
            <Input.Password
              prefix={formatMessage({ id: 'auth.newPassword' })}
              size="large"
            />
          </FormItem>
          <FormItem>
            <Button type="primary" size="large" block htmlType="submit">
              {formatMessage({ id: 'auth.resetAndLogin' })}
            </Button>
          </FormItem>
        </Form>
      </AuthFormWrapper>
    </div>
  );
};
export default ResetPassword;
