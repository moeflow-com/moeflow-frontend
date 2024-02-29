import { css } from '@emotion/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { Icon } from '.';
import { FC } from '../interfaces';
import style from '../style';
import { clickEffect } from '../utils/style';
import { Tooltip, TooltipProps } from './Tooltip';

/** 按钮的属性接口 */
interface ButtonProps {
  tooltipProps?: TooltipProps;
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
  const buttonContent =
    type === 'link' ? (
      <a className="Button__Content" {...linkProps}>
        {buttonContentInner}
      </a>
    ) : (
      <div className="Button__Content">{buttonContentInner}</div>
    );

  return (
    <div
      className={classNames('Button', className, {
        'Button--disibled': disabled || loading,
        'Button--noChildren': !children,
      })}
      css={css`
        .Button__Content {
          padding: 0 ${style.paddingBase}px;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 45px;
          min-width: 45px;
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
        &.Button--disibled {
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
      `}
      onClick={disabled || loading ? undefined : onClick}
    >
      {tooltipProps ? (
        <Tooltip {...tooltipProps}>{buttonContent}</Tooltip>
      ) : (
        buttonContent
      )}
    </div>
  );
};
