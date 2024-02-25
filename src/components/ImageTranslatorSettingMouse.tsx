import { css } from '@emotion/core';
import React from 'react';
import { useIntl } from 'react-intl';
import { FC } from '../interfaces';
import classNames from 'classnames';

/** 模板的属性接口 */
interface ImageTranslatorSettingMouseProps {
  className?: string;
}
/**
 * 模板
 */
export const ImageTranslatorSettingMouse: FC<
  ImageTranslatorSettingMouseProps
> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n

  return (
    <div
      className={classNames(['ImageTranslatorSettingMouse', className])}
      css={css`
        display: grid;
        grid-template-columns: 150px 1fr 150px 1fr;
        grid-row-gap: 10px;
        grid-column-gap: 10px;
        align-items: center;
        margin-bottom: 10px;
        .ImageTranslatorSettingMouse__HeaderLabel {
          font-weight: bold;
          line-height: 32px;
        }
        .ImageTranslatorSettingMouse__FunctionLabel {
          color: #999;
          font-weight: bold;
        }
      `}
    >
      <div className="ImageTranslatorSettingMouse__HeaderLabel">
        {formatMessage({ id: 'mouse.function' })}
      </div>
      <div className="ImageTranslatorSettingMouse__HeaderLabel">
        {formatMessage({ id: 'mouse.key' })}
      </div>
      <div className="ImageTranslatorSettingMouse__HeaderLabel">
        {formatMessage({ id: 'mouse.function' })}
      </div>
      <div className="ImageTranslatorSettingMouse__HeaderLabel">
        {formatMessage({ id: 'mouse.key' })}
      </div>
      <div className="ImageTranslatorSettingMouse__FunctionLabel">
        {formatMessage({ id: 'mouse.addInLabel' })}
      </div>
      <div className="ImageTranslatorSettingMouse__Label">
        {formatMessage({ id: 'mouse.leftOnImage' })}
      </div>
      <div className="ImageTranslatorSettingMouse__FunctionLabel">
        {formatMessage({ id: 'mouse.addOutLabel' })}
      </div>
      <div className="ImageTranslatorSettingMouse__Label">
        {formatMessage({ id: 'mouse.rightOnImage' })}
      </div>
      <div className="ImageTranslatorSettingMouse__FunctionLabel">
        {formatMessage({ id: 'mouse.changeLabelPosition' })}
      </div>
      <div className="ImageTranslatorSettingMouse__Label">
        {formatMessage({ id: 'mouse.middleOnLabel' })}
      </div>
      <div className="ImageTranslatorSettingMouse__FunctionLabel">
        {formatMessage({ id: 'mouse.deleteLabel' })}
      </div>
      <div className="ImageTranslatorSettingMouse__Label">
        {formatMessage({ id: 'mouse.rightOnLabel' })}
      </div>
    </div>
  );
};
