import { css } from '@emotion/core';
import { Icon } from '.';
import { Button } from 'antd';
import { ValidateStatus as AntdValidateStatus } from 'antd/lib/form/FormItem';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { CAPTCHAInput } from '../components';
import { CAPTCHAInputRef, CAPTCHAInputValue } from '../components/CAPTCHAInput';
import style from '../style';
import { FC } from '../interfaces';
import { clickEffect } from '../utils/style';

export type ValidateStatus = AntdValidateStatus;
export interface OnSubmit {
  ({ refresh }: { refresh: () => void }): void;
}
/** 人机验证码弹出框的属性接口 */
interface CAPTCHAModalProps {
  help?: string;
  buttonText?: string;
  buttonLoading?: boolean;
  onSubmit?: OnSubmit;
  onChange?: (captcha: CAPTCHAInputValue) => void;
  onValidateError?: () => void;
  onClose?: () => void;
  className?: string;
}
/**
 * 人机验证码弹出框
 */
export const CAPTCHAModal: FC<CAPTCHAModalProps> = ({
  help,
  onSubmit,
  onChange,
  onClose,
  buttonLoading = false,
  buttonText,
  onValidateError,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const defaultCAPTCHAValue = {
    value: '',
    info: '',
  };
  const [captcha, setCAPTCHA] = useState<CAPTCHAInputValue>(
    defaultCAPTCHAValue
  );
  const inputRef = useRef<CAPTCHAInputRef>(null);

  // 按钮默认值
  if (buttonText === undefined) {
    buttonText = formatMessage({ id: 'form.ok' });
  }

  useEffect(() => {
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 处理关闭弹窗 */
  const handleClose = () => {
    if (onClose) onClose();
  };

  /** 处理按下 Enter */
  const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    submit();
  };

  /** 处理按下确认按钮 */
  const handleSubmit = () => {
    submit();
  };

  /** 提交 */
  const submit = () => {
    // 验证
    if (captcha.value.length === 4) {
      // 格式正确
      if (onSubmit) {
        onSubmit({
          /** 清空并重新获得人机验证码 */
          refresh: () => {
            inputRef.current?.refresh();
            inputRef.current?.focus();
          },
        });
      }
    } else {
      // 格式错误
      if (onValidateError) {
        onValidateError();
        inputRef.current?.focus();
      }
    }
  };

  /** 处理输入框变动 */
  const handleChange = (captcha: CAPTCHAInputValue) => {
    setCAPTCHA(captcha);
    // 发送到外部
    if (onChange) {
      onChange(captcha);
    }
  };

  return (
    <div
      className={className}
      css={css`
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        .captcha-form {
          position: relative;
          margin: 0 10px;
          padding: 21px 30px 25px 30px;
          max-width: 360px;
          background-color: #fff;
          border-radius: ${style.borderRadiusBase};
          box-shadow: ${style.boxShadowBase};
          .captcha-form-close {
            position: absolute;
            right: 16px;
            top: 10px;
            padding: 11px;
            width: 18px;
            height: 18px;
            box-sizing: content-box;
            ${clickEffect(
              css`
                .captcha-form-close-icon {
                  color: ${style.primaryColorLighter};
                }
              `,
              css`
                .captcha-form-close-icon {
                  color: ${style.primaryColorDarker};
                }
              `
            )}
            .captcha-form-close-icon {
              color: ${style.primaryColor};
              width: 18px;
              height: 18px;
            }
          }
          .captcha-title {
            color: ${style.primaryColor};
            font-size: 18px;
            margin-bottom: 24px;
            font-weight: bold;
            line-height: 1;
            .captcha-title-icon {
              margin-right: 5px;
            }
          }
          .captcha-help {
            margin-bottom: 2px;
            color: #ff4d4f;
          }
          .captcha-input {
            margin-bottom: ${help ? '0' : '14px'};
          }
        }
      `}
    >
      <div className="captcha-form">
        {/* 关闭按钮 */}
        <div className="captcha-form-close" onClick={handleClose}>
          <Icon icon="times" className="captcha-form-close-icon" />
        </div>
        {/* 标题 */}
        <div className="captcha-title">
          <Icon icon="robot" className="captcha-title-icon" />
          {formatMessage({ id: 'auth.captchaTitle' })}
        </div>
        {/* 人机验证码输入框 */}
        <CAPTCHAInput
          onPressEnter={handlePressEnter}
          onChange={handleChange}
          value={captcha}
          ref={inputRef}
        ></CAPTCHAInput>
        {help && <div className="captcha-help">{help}</div>}
        <Button
          type="primary"
          size="large"
          onClick={handleSubmit}
          block
          loading={buttonLoading}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};
