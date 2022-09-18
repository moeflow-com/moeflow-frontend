import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  Content,
  ContentItem,
  ContentTitle,
  UserEmailEditForm,
  UserPasswordEditForm,
} from '.';
import style from '../style';
import { FC } from '../interfaces';

/** 用户安全设置的属性接口 */
interface UserSettingSafeProps {
  className?: string;
}
/**
 * 用户安全设置
 */
export const UserSettingSafe: FC<UserSettingSafeProps> = ({ className }) => {
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
        <ContentTitle>
          {formatMessage({ id: 'user.passwordSetting' })}
        </ContentTitle>
        <ContentItem>
          <UserPasswordEditForm />
        </ContentItem>
      </Content>
      <Content>
        <ContentTitle>
          {formatMessage({ id: 'user.emailSetting' })}
        </ContentTitle>
        <ContentItem>
          <UserEmailEditForm />
        </ContentItem>
      </Content>
    </div>
  );
};
