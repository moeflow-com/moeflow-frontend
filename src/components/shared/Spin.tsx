import { css } from '@emotion/core';
import { Spin as AntdSpin } from 'antd';
import { SpinProps as AntdSpinProps } from 'antd/lib/spin';
import { LoadingIcon } from './LoadingIcon';
import { FC } from '@/interfaces';

/** Spin 的属性接口 */
interface SpinProps extends AntdSpinProps {
  className?: string;
}
/**
 * Spin
 */
export const Spin: FC<SpinProps> = ({ className, children, ...spinProps }) => {
  return (
    <AntdSpin
      className={className}
      css={css`
        display: flex !important;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        .ant-spin-text {
          margin-top: 8px;
        }
      `}
      indicator={<LoadingIcon />}
      {...spinProps}
    >
      {children}
    </AntdSpin>
  );
};
