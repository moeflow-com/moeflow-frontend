import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { Content, ContentItem, ContentTitle, ProjectSetEditForm } from '.';
import { FC } from '../interfaces';
import style from '../style';

/** 项目集基础设置的属性接口 */
interface ProjectSetSettingBaseProps {
  className?: string;
}
/**
 * 项目集基础设置
 */
export const ProjectSetSettingBase: FC<ProjectSetSettingBaseProps> = ({
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
        <ContentTitle>{formatMessage({ id: 'projectSet.info' })}</ContentTitle>
        <ContentItem>
          <ProjectSetEditForm />
        </ContentItem>
      </Content>
    </div>
  );
};
