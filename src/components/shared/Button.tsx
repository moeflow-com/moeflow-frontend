import { css, jsx } from '@emotion/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import type React from 'react';
import { Icon } from '..';
import { FC } from '@/interfaces';
import style from '../../style';
import { clickEffect } from '@/utils/style';
import { Tooltip, TooltipProps } from './Tooltip';

const sizeMap = {
  xs: 24,
  sm: 28,
  default: 45,
} as const;

/** 按钮的属性接口 */
interface ButtonProps {
  tooltipProps?: TooltipProps;
  /**
   * defaults to be 'div' but unpreferable
   */
  elem?: 'button';
  size?: keyof typeof sizeMap;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'link';
  linkProps?: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >;
  color?: string;
  colorDisibled?: string;
  iconProps?: Omit<FontAwesomeIconProps, 'icon'>;
  icon?: IconProp;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className?: string;
}

/**
 * 模板
 */
export const Button: FC<ButtonProps> = ({
  elem = 'div',
  size = 'default',
  icon,
  tooltipProps,
  iconProps,
  type = 'button',
  linkProps,
  color = style.primaryColor,
  colorDisibled = style.primaryColorLightest,
  loading = false,
  disabled = false,
  onClick,
  className,
  children,
}) => {
  let iconName: IconProp | undefined = icon;
  if (loading) {
    iconName = 'spinner';
  }

  const buttonContentInner = (
    <>
      {iconName && (
        <Icon
          className="Button__Icon"
          icon={iconName}
          spin={loading}
          {...iconProps}
        ></Icon>
      )}
      {children}
    </>
  );
  let buttonContent =
    type === 'link' ? (
      <a className="Button__Content" {...linkProps}>
        {buttonContentInner}
      </a>
    ) : (
      <div className="Button__Content">{buttonContentInner}</div>
    );
  if (tooltipProps) {
    buttonContent = <Tooltip {...tooltipProps}>{buttonContent}</Tooltip>;
  }

  return jsx(
    elem ?? 'div',
    {
      className: classNames('Button', className, {
        'Button--disabled': disabled || loading,
        'Button--noChildren': !children,
      }),
      css: css`
        background-color: transparent;
        border: none;
        .Button__Content {
          padding: 0 ${style.paddingBase}px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: ${sizeMap[size]}px;
          min-width: ${sizeMap[size]}px;
          color: ${color};
          font-size: 13px;
          font-weight: bold;
          a {
            display: block;
            width: 100%;
            height: 100%;
            color: ${color};
          }
        }
        .Button__Icon {
          color: ${color};
          margin-right: 10px;
        }
        ${disabled || loading || clickEffect()}
        &.Button--disabled {
          cursor: not-allowed;
          user-select: none;
          .Button__Icon,
          .Button__Content {
            color: ${colorDisibled};
          }
          a {
            cursor: not-allowed;
            user-select: none;
          }
        }
        &.Button--noChildren {
          .Button__Content {
            padding: 0;
            .Button__Icon {
              margin-right: 0;
            }
          }
        }
      `,
      onClick: disabled || loading ? undefined : onClick,
    },
    buttonContent,
  );
};
