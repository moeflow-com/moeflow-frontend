import { css } from '@emotion/core';
import { Input, InputRef } from 'antd';
import { CancelToken } from 'axios';
import classNames from 'classnames';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import api from '@/apis';
import { LoadingIcon } from '@/components';
import { getIntl } from '@/locales';
import style from '@/style';
import { getCancelToken } from '@/utils/api';
import { clickEffect, imageClickEffect } from '@/utils/style';

/** 用于 Form.Item 校验验证码，rules={[{validator: checkCAPTCHA}]} */
export const checkCAPTCHA = (rule: any, captcha: CAPTCHAInputValue) => {
  const intl = getIntl();
  if (captcha.value === '') {
    return Promise.reject(intl.formatMessage({ id: 'form.required' }));
  }
  if (captcha.value.length !== 4) {
    return Promise.reject(
      intl.formatMessage({ id: 'form.stringLen' }, { len: 4 }),
    );
  }
  return Promise.resolve();
};

export interface GetCAPTCHAParams {
  focus?: boolean;
  cancelToken?: CancelToken;
  onFinish?: () => void;
}

export interface CAPTCHAInputRef extends InputRef {
  /**
   * 更新验证码
   * @param focus 更新后是否 focus 到 Input（默认值 true）
   * @param onFinish 更新后执行的操作
   */
  refresh: (params?: GetCAPTCHAParams) => void;
}
/** 输入框的值 */
export interface CAPTCHAInputValue {
  value: string;
  info: string;
}
/** 人机验证码输入框的属性接口 */
interface CAPTCHAInputProps {
  onPressEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (captcha: CAPTCHAInputValue) => void;
  value?: CAPTCHAInputValue;
  className?: string;
}
/**
 * 人机验证码输入框
 */
const CAPTCHAInputWithoutRef: React.ForwardRefRenderFunction<
  CAPTCHAInputRef,
  CAPTCHAInputProps
> = ({ onPressEnter, onChange, value, className } = {}, ref) => {
  const { formatMessage } = useIntl(); // i18n
  const [captchaValue, setCaptchaValue] = useState(value?.value || '');
  const [captchaInfo, setCaptchaInfo] = useState(value?.info || '');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const inputRef = useRef<InputRef>(null);

  // 将控制函数注册到父组件的 ref
  useImperativeHandle(ref, () => {
    const imperatives = {
      ...inputRef.current,
      refresh: getCAPTCHA,
    };
    return imperatives as CAPTCHAInputRef;
  });

  useEffect(() => {
    const [cancelToken, cancel] = getCancelToken();
    getCAPTCHA({ cancelToken });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 获取验证码 */
  const getCAPTCHA = (
    { focus = true, cancelToken, onFinish } = {} as GetCAPTCHAParams,
  ) => {
    setCaptchaLoading(true);
    api
      .getCAPTCHA({
        configs: {
          cancelToken,
        },
      })
      .then((result) => {
        setCaptchaValue(''); // 清空当前值
        setCaptchaInfo(result.data.info);
        setCaptchaImage(result.data.image);
        // 设置焦点
        if (focus) {
          inputRef.current?.focus();
        }
        if (onChange) {
          onChange({
            value: '',
            info: result.data.info,
          });
        }
        setCaptchaLoading(false);
        if (onFinish) {
          onFinish();
        }
      })
      .catch((result) => {
        result.default();
      });
  };

  /** 处理输入框变动 */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 只允许输入数字
    e.target.value = e.target.value.replace(/[^\d]/g, '');
    // 如果过滤后和之前值相同，则跳过
    if (e.target.value === captchaValue) return;
    // 记录输入的验证码
    setCaptchaValue(e.target.value);
    // 发送到外部
    if (onChange) {
      onChange({
        value: e.target.value,
        info: captchaInfo,
      });
    }
  };

  return (
    <Input
      className={classNames(['captcha-input', className])}
      css={css`
        .captcha-loading {
          min-width: 120px;
          min-height: 38px;
          border-radius: ${style.borderRadiusBase} 0 0 ${style.borderRadiusBase};
          display: flex;
          justify-content: center;
          align-items: center;
          .captcha-loading-icon {
            width: 16px;
            height: 16px;
            color: #bbb;
          }
          ${clickEffect()};
        }
        .captcha-image {
          min-width: 120px;
          min-height: 38px;
          border-radius: ${style.borderRadiusBase} 0 0 ${style.borderRadiusBase};
          cursor: pointer;
          user-select: none;
          ${imageClickEffect()};
        }
        .ant-input-group-addon {
          padding: 0;
        }
      `}
      addonBefore={
        captchaLoading ? (
          <div
            onClick={() => {
              getCAPTCHA();
            }}
            className="captcha-loading"
          >
            <LoadingIcon />
          </div>
        ) : (
          <img
            onClick={() => {
              getCAPTCHA();
            }}
            className="captcha-image"
            src={captchaImage}
            alt={formatMessage({ id: 'auth.captchaRefreshTip' })}
          />
        )
      }
      placeholder={formatMessage({ id: 'auth.captchaTip' })}
      size="large"
      maxLength={4}
      onPressEnter={onPressEnter}
      onChange={handleChange}
      value={captchaValue}
      name="captcha"
      ref={inputRef}
    />
  );
};
export const CAPTCHAInput = React.forwardRef(CAPTCHAInputWithoutRef);
