import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useTitle } from '../hooks';
import { FC } from '../interfaces';
import { DemoOcrFiles } from '../components/TranslateCompanion/TranslateCompanion';

/** 模板的属性接口 */
interface TmpProps {}
/**
 * 模板
 */
export const DemoOcr: FC<TmpProps> = () => {
  const history = useHistory();
  const { formatMessage } = useIntl();
  useTitle();

  return (
    <div css={css``}>
      <DemoOcrFiles />
    </div>
  );
};
