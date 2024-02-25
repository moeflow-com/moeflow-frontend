import React from 'react';
import { useIntl } from 'react-intl';
import { FC } from '../interfaces';
import { EmptyTip } from '.';

/** 项目完结提示的属性接口 */
interface ProjectFinishedTipProps {
  className?: string;
}
/**
 * 项目完结提示
 */
export const ProjectFinishedTip: FC<ProjectFinishedTipProps> = ({
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n

  return <EmptyTip text={formatMessage({ id: 'project.finishedTip' })} />;
};
