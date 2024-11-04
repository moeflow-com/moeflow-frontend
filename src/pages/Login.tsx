import { css } from '@emotion/core';
import { Button, Input, Switch, Form as AntdForm, InputRef } from 'antd';
import React, { useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { FailureResults, resultTypes, api } from '../apis';
import {
  AuthFormWrapper,
  CAPTCHAInput,
  EmailInput,
  FormItem,
  Header,
  Form,
} from '../components';
import { CAPTCHAInputRef, checkCAPTCHA } from '../components/CAPTCHAInput';
import { setUserToken } from '../store/user/slice';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';
import { EMAIL_REGEX } from '../utils/regex';

/** 登录页的属性接口 */
interface LoginProps {
  beforeRedirect?: boolean;
}
/**
 * 登录页
 */
const Login: FC<LoginProps> = ({ beforeRedirect = false } = {}) => {
  const { formatMessage } = useIntl(); // i18n
  useTitle({ prefix: formatMessage({ id: 'auth.login' }) }); // 设置标题
  const history = useHistory();
  const dispatch = useDispatch();
  const [form] = AntdForm.useForm();
  const captchaInputRef = useRef<CAPTCHAInputRef>(null);

  // 用于密码错误，自动定位到密码输入框（因为密码错误刷新人机验证码，会错误 focus 到人机验证码输入框）
  const passwordInputRef = useRef<InputRef>(null);

  /** 提交表单 */
  const handleFinish = (values: any) => {
    api.auth
      .login({
        data: {
          email: values.email,
          password: values.password,
          captcha: values.captcha.value,
          captchaInfo: values.captcha.info,
        },
      })
      .then((result) => {
        // 重置表单
        form.resetFields();
        // 记录 token 到 Store 中
        dispatch(
          setUserToken({
            token: result.data.token,
            rememberMe: values.rememberMe,
          }),
        );
        // 跳转到仪表盘
        history.push('/dashboard/projects');
      })
      .catch((result: FailureResults) => {
        if (result.type === resultTypes.VALIDATION_FAILURE) {
          result.default(form);
          if (result.data.message.captcha) {
            // 如果是验证码错误，则刷新验证码
            captchaInputRef.current?.refresh({
              onFinish: () => {
                form.setFields([
                  {
                    name: 'captcha',
                    errors: result.data.message.captcha,
                  },
                ]); // 保持错误提示
              },
            });
          } else if (result.data.message.password) {
            // 如果是密码错误，则刷新人机验证码（人机验证码被使用所以失效了）
            form.setFields([{ name: 'password', value: '' }]); // 清空密码
            captchaInputRef.current?.refresh({ focus: false });
            passwordInputRef.current?.focus();
          }
          return;
        }
        result.default();
      });
  };

  /**
   * 前往重置密码页面
   */
  const toResetPassword = () => {
    history.push('/reset-password');
  };

  return (
    <>
      <div
        css={css`
          min-height: 100%;
          display: flex;
          flex-direction: column;
          .Login__SubmitFormItem {
            margin-bottom: 16.5px;
          }
          .Login__ToResetPassword {
            text-align: center;
            width: 100%;
            .ant-btn {
              font-size: 15px;
            }
          }
        `}
      >
        <Header></Header>
        <AuthFormWrapper
          css={
            beforeRedirect &&
            css`
              .form {
                .title {
                  font-size: 40px;
                }
              }
            `
          }
          title={
            beforeRedirect
              ? formatMessage({ id: 'auth.loginFirst' })
              : formatMessage({ id: 'auth.login' })
          }
          navTip={formatMessage({ id: 'auth.toReigsterTip' })}
          navLink="/register"
        >
          <Form
            name="login-form"
            form={form}
            onFinish={handleFinish}
            initialValues={{
              rememberMe: false,
            }}
          >
            <FormItem
              name="email"
              rules={[
                { required: true },
                {
                  pattern: EMAIL_REGEX,
                  message: formatMessage({ id: 'form.formatWrong' }),
                },
              ]}
            >
              <EmailInput
                prefix={formatMessage({ id: 'site.email' })}
                size={'large'}
              />
            </FormItem>
            <FormItem
              name="password"
              rules={[{ required: true }, { min: 6 }, { max: 60 }]}
            >
              <Input.Password
                prefix={formatMessage({ id: 'site.password' })}
                size="large"
                ref={passwordInputRef}
              />
            </FormItem>
            <FormItem name="captcha" rules={[{ validator: checkCAPTCHA }]}>
              <CAPTCHAInput ref={captchaInputRef} />
            </FormItem>
            <FormItem
              css={css`
                .ant-form-item-control-input-content {
                  display: flex;
                  color: #858585;
                  font-size: 15px;
                  justify-content: center;
                  align-items: center;
                  .label {
                    margin-right: 10px;
                  }
                }
              `}
            >
              <div className="label">
                {formatMessage({ id: 'auth.rememberMe' })}
              </div>
              <FormItem name="rememberMe" valuePropName="checked" noStyle>
                <Switch />
              </FormItem>
            </FormItem>
            <FormItem className="Login__SubmitFormItem">
              <Button type="primary" size="large" block htmlType="submit">
                {formatMessage({ id: 'auth.login' })}
              </Button>
            </FormItem>
            <div className="Login__ToResetPassword">
              <Button type="link" onClick={toResetPassword}>
                {formatMessage({ id: 'auth.toResetPasswordTip' })}
              </Button>
            </div>
          </Form>
        </AuthFormWrapper>
      </div>
    </>
  );
};
export default Login;
