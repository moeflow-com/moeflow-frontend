import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { Content, ContentItem, ContentTitle } from '@/components';
import { FC } from '@/interfaces';
import style from '../../style';
import { AvatarUpload } from '../AvatarUpload';
import { UserEditForm } from './UserEditForm';
import { LocalePicker } from './LocalePicker';

/** 用户基础设置的属性接口 */
interface UserBasicSettingsProps {
  className?: string;
}
/**
 * 用户基础设置
 */
export const UserBasicSettings: FC<UserBasicSettingsProps> = ({
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n

  return (
    <div
      className={className}
      css={css`
        width: 100%;
        max-width: ${style.contentMaxWidth}px;
        padding: ${style.paddingBase}px;
      `}
    >
      <Content>
        <LocalePicker />
        <ContentTitle>{formatMessage({ id: 'user.info' })}</ContentTitle>
        <div style={{ marginBottom: '24px' }}>
          <AvatarUpload type="user" />
        </div>
        <ContentItem>
          <UserEditForm />
        </ContentItem>
      </Content>
    </div>
  );
};
