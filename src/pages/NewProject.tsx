import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  Content,
  ContentItem,
  ContentTitle,
  DashboardBox,
  GroupJoinForm,
} from '../components';
import { FC } from '../interfaces';
import style from '../style';
import { useTitle } from '../hooks';

/** 加入项目的属性接口 */
interface NewProjectProps {}
/**
 * 加入项目
 */
const NewProject: FC<NewProjectProps> = () => {
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
            {formatMessage({ id: 'site.joinProject' })}
          </ContentTitle>
          <ContentItem>
            <GroupJoinForm groupType="project" />
          </ContentItem>
        </Content>
      }
    />
  );
};
export default NewProject;
