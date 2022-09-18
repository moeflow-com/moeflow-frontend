import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  Content,
  ContentItem,
  ContentTitle,
  DashboardBox,
  GroupJoinForm,
  TeamCreateForm,
} from '../components';
import { FC } from '../interfaces';
import style from '../style';
import { useTitle } from '../hooks';

/** 加入/创建团队的属性接口 */
interface NewTeamProps {}
/**
 * 加入/创建团队
 */
const NewTeam: FC<NewTeamProps> = () => {
  const { formatMessage } = useIntl(); // i18n
  useTitle(); // 设置标题

  return (
    <DashboardBox
      content={
        <Content
          css={css`
            width: 100%;
            max-width: ${style.contentMaxWidth}px;
            padding: ${style.paddingBase}px;
          `}
        >
          <ContentTitle>
            {formatMessage({ id: 'site.createTeam' })}
          </ContentTitle>
          <ContentItem>
            <TeamCreateForm />
          </ContentItem>
          <ContentTitle
            css={css`
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid ${style.borderColorBase};
            `}
          >
            {formatMessage({ id: 'site.joinTeam' })}
          </ContentTitle>
          <ContentItem>
            <GroupJoinForm groupType="team" />
          </ContentItem>
        </Content>
      }
    />
  );
};
export default NewTeam;
