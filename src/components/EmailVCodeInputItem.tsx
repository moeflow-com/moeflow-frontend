import { css } from '@emotion/core';
import { Form, Input } from 'antd';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { InputProps } from 'antd/lib/input';
import classNames from 'classnames';
import React, { useRef, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import api, { FailureResults, resultTypes } from '../apis';
import style from '../style';
import { FC } from '../interfaces';
import { EMAIL_REGEX } from '../utils/regex';
import { clickEffect } from '../utils/style';
import { CAPTCHAInputValue } from './CAPTCHAInput';
import { CAPTCHAModal, OnSubmit, ValidateStatus } from './CAPTCHAModal';
import { EmailInput } from './EmailInput';
import { FormItem } from './FormItem';

/** 获取邮箱验证码输入框的属性接口 */
interface EmailVCodeInputItemProps extends Omit<FormItemProps, 'children'> {
  /** 获取邮件的类型 */
  vCodeType: 'confirmEmail' | 'resetPassword' | 'resetEmail';
  /** 默认邮箱 */
  defaultEmail?: string;
  /** waiting=true 发送成功但在等待中，没有发出新邮件 */
  onSend?: (waiting: boolean) => void;
  /** 邮箱输入框的属性 */
  inputProps?: InputProps;
  className?: string;
}
/**
 * 获取邮箱验证码输入框
 */
export const EmailVCodeInputItem: FC<EmailVCodeInputItemProps> = (
  {
    vCodeType,
    onSend,
    defaultEmail = '',
    inputProps = {},
    className,
    ...itemProps
  } = {} as EmailVCodeInputItemProps
) => {
  const { formatMessage } = useIntl(); // i18n
  // 邮箱输入框
  const [email, setEmail] = useState(defaultEmail);
  const [emailHelp, setEmailHelp] = useState<string | string[]>();
  const [
    emailValidateStatus,
    setEmailValidateStatus,
  ] = useState<ValidateStatus>();
  const emailInputRef = useRef<Input>(null);
  const defaultEmailSubmitText = formatMessage({
    id: 'auth.getEmailVCode',
  });
  const [emailSubmitText, setEmailSubmitText] = useState(
    defaultEmailSubmitText
  );
  const [emailSubmitWaiting, setEmailSubmitWaiting] = useState(false);
  const emailSubmitWaitingRef = useRef(false);
  // 验证码输入框
  const [captchaInputVisible, setCAPTCHAInputVisible] = useState(false);
  const [captchaInputButtonLoading, setCAPTCHAInputButtonLoading] = useState(
    false
  );
  const defaultCAPTCHASubmitText = formatMessage({
    id: 'auth.getEmailVCode',
  });
  const [captchaSubmitText, setCAPTCHASubmitText] = useState(
    defaultCAPTCHASubmitText
  );
  const [captchaValue, setCAPTCHAValue] = useState('');
  const [captchaInfo, setCAPTCHAInfo] = useState('');
  const [captchaHelp, setCAPTCHAHelp] = useState<string>();
  // 保持住人机验证码的 Help，使其不被下一次 onChange 删掉
  //（提交人机验证码调用 refresh 时，肯定会导致 onChange）
  const holdCAPTCHAHelpOnNextChangeRef = useRef(false);

  const _mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      _mountedRef.current = false;
    };
  }, []);

  /**
   * 邮箱输入框部分
   */
  /** 处理邮件 Input 的改变 */
  const handleEmailInputChange: (value: string) => void = (value) => {
    // 清除邮箱错误 Help
    clearEmailError();
    // 清除等待
    stopWaiting();
    // 记录邮箱
    setEmail(value);
  };

  /** 处理在邮件 Input 按下回车 */
  const handleEmailInputPressEnter: (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => void = (e) => {
    e.preventDefault();
    submit();
    // 调用 props 中的 onPressEnter
    if (inputProps.onPressEnter) {
      inputProps.onPressEnter(e);
    }
  };

  /** 处理按下提交邮箱按钮 */
  const handleSumbitEmailClick = () => {
    submit();
  };

  /** 设置邮箱输入框错误 */
  const setEmailError = (error: string | string[]) => {
    setEmailHelp(error);
    setEmailValidateStatus('error');
  };

  /** 清除邮箱输入框错误 */
  const clearEmailError = () => {
    setEmailHelp(undefined);
    setEmailValidateStatus(undefined);
  };

  /**
   * 人机验证码输入框部分
   */
  /** 处理人机验证码 Input 的改变 */
  const handleCAPTCHAChange: (captcha: CAPTCHAInputValue) => void = (
    captcha
  ) => {
    if (!holdCAPTCHAHelpOnNextChangeRef.current) {
      // 清理提示
      setCAPTCHAHelp('');
    } else {
      // 本次不清理提示，设为 false，下次清理
      holdCAPTCHAHelpOnNextChangeRef.current = false;
    }
    // 记录验证码
    setCAPTCHAValue(captcha.value);
    setCAPTCHAInfo(captcha.info);
  };

  /** 处理人机验证码弹窗关闭 */
  const handleCAPTCHEModalClose = () => {
    setCAPTCHAInputVisible(false);
    emailInputRef.current?.focus();
  };

  /** 处理人机验证码 Input 提交 */
  const handleCAPTCHAInputSubmit: OnSubmit = ({ refresh }) => {
    setCAPTCHAInputButtonLoading(true);
    setCAPTCHASubmitText(formatMessage({ id: 'auth.sending' }));
    let getEmailVCode;
    // 根据不同类型，请求不同接口
    if (vCodeType === 'confirmEmail') {
      getEmailVCode = api.getConfirmEmailVCode({
        data: {
          email,
          captcha: captchaValue,
          captchaInfo,
        },
      });
    } else if (vCodeType === 'resetPassword') {
      getEmailVCode = api.getResetPasswordVCode({
        data: {
          email,
          captcha: captchaValue,
          captchaInfo,
        },
      });
    } else {
      getEmailVCode = api.getResetEmailVCode();
    }
    getEmailVCode
      .then((result) => {
        // 隐藏人机验证码输入框
        setCAPTCHAInputVisible(false);
        // 设置等待
        startWaiting(result.data.wait);
        // 调用已发送回调
        if (onSend) {
          onSend(false);
        }
      })
      .catch((result: FailureResults) => {
        if (result.type === resultTypes.VALIDATION_FAILURE) {
          if (result.data.message.email) {
            // 如果是邮箱错误
            // 隐藏人机验证码输入框
            setCAPTCHAInputVisible(false);
            // 显示邮箱错误 Help
            setEmailError(result.data.message.email);
            // 焦点到邮箱输入框
            emailInputRef.current?.focus();
          } else {
            // 验证码错误
            setCAPTCHAHelp(formatMessage({ id: 'auth.captchaWrong' }));
            // 保持住提示
            holdCAPTCHAHelpOnNextChangeRef.current = true;
            // 重置验证码
            refresh();
          }
          return;
        }
        if (result.type === resultTypes.BASIC_FAILURE) {
          if (result.data.code === 2004) {
            // 冷却中，则提示稍后再试
            // 隐藏人机验证码输入框
            setCAPTCHAInputVisible(false);
            // 重置验证码
            refresh();
            setEmailError(formatMessage({ id: 'form.needWait' }));
            // 设置提交按钮文本
            startWaiting(
              ((result.data.message as unknown) as { wait: number }).wait
            );
            // 调用已发送回调
            if (onSend) {
              onSend(true);
            }
            return;
          }
        }
        result.default();
      })
      .finally(() => {
        // 最终关闭人机验证码 Loading 按钮，并显示原来的文本
        setCAPTCHAInputButtonLoading(false);
        setCAPTCHASubmitText(defaultCAPTCHASubmitText);
      });
  };

  /** 处理人机验证码格式错误 */
  const handleCAPTCHAInputValidateError = () => {
    setCAPTCHAHelp(formatMessage({ id: 'form.formatWrong' }));
  };

  /** 开始发送等待 */
  const startWaiting = (seconds: number) => {
    setEmailSubmitWaiting(true);
    emailSubmitWaitingRef.current = true;
    setEmailSubmitText(
      formatMessage(
        { id: 'auth.getEmailVCodeWait' },
        {
          seconds,
        }
      )
    );
    countdownWaiting(seconds);
  };
  /** 结束发送等待 */
  const stopWaiting = () => {
    setEmailSubmitWaiting(false);
    emailSubmitWaitingRef.current = false;
    setEmailSubmitText(defaultEmailSubmitText);
    clearEmailError();
  };
  /** 倒计时等待 */
  const countdownWaiting = (seconds: number) => {
    setTimeout(() => {
      // 可能已经卸载组件
      if (!_mountedRef.current) return;
      // 如果被手动停止了，则停止递归
      if (!emailSubmitWaitingRef.current) return;
      // -1s
      seconds -= 1;
      if (seconds > 0) {
        setEmailSubmitText(
          formatMessage({ id: 'auth.getEmailVCodeWait' }, { seconds: seconds })
        );
        countdownWaiting(seconds);
      } else {
        stopWaiting();
      }
    }, 1000);
  };

  /** 检查邮箱格式 */
  const validateEmail: () => boolean = () => {
    // 邮箱为空
    if (email === '') {
      setEmailError(formatMessage({ id: 'form.required' }));
      return false;
    }
    // 检测邮箱是否符合规则
    if (!EMAIL_REGEX.test(email)) {
      setEmailError(formatMessage({ id: 'form.formatWrong' }));
      return false;
    }
    return true;
  };

  /** 显示人机验证码框 */
  const submit = () => {
    // 等待中则不响应
    if (emailSubmitWaiting) return;
    // 邮箱验证邮箱
    if (!validateEmail()) {
      emailInputRef.current?.focus();
      return;
    }
    if (vCodeType === 'resetEmail') {
      // 重置邮箱时不需要验证码，跳过验证码步骤
      handleCAPTCHAInputSubmit({ refresh: () => {} });
    } else {
      setCAPTCHAInputVisible(true);
    }
  };

  return (
    <>
      <Form.Item
        validateStatus={emailValidateStatus}
        help={emailHelp}
        label={itemProps.label}
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
          {...itemProps}
          noStyle
        >
          <EmailInput
            css={css`
              border-bottom-right-radius: 0;
              border-bottom-left-radius: 0;
            `}
            {...inputProps} // 用于覆盖原 props 中属性的属性，需要放在下面
            value={email}
            onChange={handleEmailInputChange}
            onPressEnter={handleEmailInputPressEnter}
            ref={emailInputRef}
          />
        </FormItem>
        <div
          css={css`
            border: 0;
            background-color: #f5f5f5;
            border-radius: ${`0 0 ${style.borderRadiusBase} ${style.borderRadiusBase}`};
            color: #5f5f5f;
            text-align: center;
            height: 30px;
            line-height: 30px;
            ${clickEffect()}
            &.disabled {
              cursor: not-allowed;
              color: #aaa;
              &:hover {
                background-color: #f5f5f5;
              }
              &:active {
                background-color: #f5f5f5;
              }
            }
          `}
          onClick={handleSumbitEmailClick}
          className={classNames({ disabled: emailSubmitWaiting })}
        >
          {emailSubmitText}
        </div>
      </Form.Item>
      {/* 人机验证码弹出框 */}
      {captchaInputVisible && (
        <CAPTCHAModal
          help={captchaHelp}
          onValidateError={handleCAPTCHAInputValidateError}
          buttonText={captchaSubmitText}
          buttonLoading={captchaInputButtonLoading}
          onChange={handleCAPTCHAChange}
          onSubmit={handleCAPTCHAInputSubmit}
          onClose={handleCAPTCHEModalClose}
        />
      )}
    </>
  );
};
