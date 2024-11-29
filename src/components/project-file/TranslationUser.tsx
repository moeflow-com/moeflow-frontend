import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { Avatar, Icon, Tooltip } from '@/components';
import { FC } from '@/interfaces';
import style from '@/style';

/** 翻译用户显示的属性接口 */
interface TranslationUserProps {
  iconType: 'translation' | 'proofread';
  iconTooltip?: string;
  avatar?: string;
  name?: string;
  className?: string;
}
/**
 * 翻译用户显示
 */
export const TranslationUser: FC<TranslationUserProps> = ({
  iconType,
  iconTooltip,
  avatar,
  name,
  className,
}) => {
  const icon = iconType === 'translation' ? 'pencil-alt' : 'pen-nib';

  return (
    <div
      className={classNames('TranslationUser', className)}
      css={css`
        display: flex;
        align-items: center;
        min-height: 24px;
        .TranslationUser__UserName {
          margin-right: 5px;
        }
        .TranslationUser__UserName {
          color: ${style.textColorSecondary};
          font-size: 12px;
          margin-right: 5px;
        }
        .TranslationUser__UserAvatar {
          margin-right: 3px;
        }
        .TranslationUser__TypeIcon {
          height: 12px;
          margin-right: 4px;
          color: ${style.textColorSecondaryLighter};
        }
      `}
    >
      <Tooltip title={iconTooltip} placement="left" disabled={!iconTooltip}>
        <Icon className="TranslationUser__TypeIcon" icon={icon} />
      </Tooltip>
      {avatar && (
        <Avatar
          className="TranslationUser__UserAvatar"
          url={avatar}
          type="user"
          size={16}
        />
      )}
      {name && <div className="TranslationUser__UserName">{name}</div>}
    </div>
  );
};
