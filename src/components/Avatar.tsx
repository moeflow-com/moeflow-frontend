import { css } from '@emotion/core';
import { Avatar as AntdAvatar, Badge } from 'antd';
import { AvatarProps as AntdAvatarProps } from 'antd/lib/avatar';
import React from 'react';
import { useIntl } from 'react-intl';
import defaultTeamAvatar from '../images/common/default-team-avatar.jpg';
import defaultUserAvatar from '../images/common/default-user-avatar.jpg';

/** 头像的属性接口 */
interface AvatarProps {
  shape?: 'circle' | 'square';
  url?: string | null;
  type?: 'team' | 'user';
  dot?: boolean;
  className?: string;
}
/**
 * 头像
 */
const AvatarWithoutRef: React.ForwardRefRenderFunction<
  any,
  AvatarProps & AntdAvatarProps
> = ({ dot = false, shape, url, type, className, ...avatarProps }, ref) => {
  const { formatMessage } = useIntl(); // i18n

  // 默认头像
  let avatarUrl;
  switch (type) {
    case 'user':
      avatarUrl = defaultUserAvatar;
      break;
    case 'team':
      avatarUrl = defaultTeamAvatar;
      break;
  }
  if (url) {
    avatarUrl = url;
  }

  // 默认形状
  let avatarShape: 'circle' | 'square' | undefined;
  if (shape) {
    avatarShape = shape;
  } else {
    if (type === 'user') {
      avatarShape = 'circle';
    } else {
      avatarShape = 'square';
    }
  }

  return (
    <Badge dot={dot}>
      <AntdAvatar
        className={className}
        css={css`
          user-select: none;
        `}
        src={avatarUrl}
        alt={formatMessage({ id: 'site.avatar' })}
        shape={avatarShape}
        {...avatarProps}
        ref={ref}
      />
    </Badge>
  );
};
export const Avatar = React.forwardRef(AvatarWithoutRef);
