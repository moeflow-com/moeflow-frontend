import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { FC } from '@/interfaces';
import classNames from 'classnames';

/** 模板的属性接口 */
interface TmpProps {
  className?: string;
}
/**
 * 模板
 */
export const Tmp: FC<TmpProps> = ({ className }) => {
  const { formatMessage } = useIntl();

  return <div className={classNames('Tmp', className)} css={css``}></div>;
};
