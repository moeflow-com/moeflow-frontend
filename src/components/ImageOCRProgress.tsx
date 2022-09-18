import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { Icon, Tooltip } from '.';
import { ParseStatuses, PARSE_STATUS } from '../constants';
import { FC } from '../interfaces';
import style from '../style';

const HEIGHT = 12;
export const IMAGE_OCR_PROGRESS_HEIGHT = HEIGHT;

/** 图片 OCR 进度的属性接口 */
interface ImageOCRProgressProps {
  parseStatus: ParseStatuses;
  parseStatusName?: string;
  parseErrorTypeDetailName?: string;
  percent?: number;
  percentName?: string;
  className?: string;
}
/**
 * 图片 OCR 进度
 */
export const ImageOCRProgress: FC<ImageOCRProgressProps> = ({
  parseStatus,
  parseStatusName = '',
  parseErrorTypeDetailName = '',
  percent = 0,
  percentName = '',
  className,
}) => {
  return (
    <div
      className={classNames(['ImageOCRProgress', className])}
      css={css`
        display: flex;
        height: ${HEIGHT}px;
        align-items: center;
        font-size: 12px;
        .ImageOCRProgress__Icon {
          margin-right: 4px;
          color: ${style.textColorSecondary};
        }
        .ImageOCRProgress__RobotIcon {
          font-size: 11px;
          margin-top: -1px;
          margin-right: 5px;
        }
        .ImageOCRProgress__Status {
          margin-right: 5px;
          line-height: 1;
        }
        .ImageOCRProgress__ErrorIcon {
          margin-left: auto;
          margin-right: 0;
        }
      `}
    >
      <Icon
        icon="robot"
        className="ImageOCRProgress__Icon ImageOCRProgress__RobotIcon"
      />
      <div className="ImageOCRProgress__Status">
        {parseStatus === PARSE_STATUS.PARSING ? percentName : parseStatusName}
      </div>
      {parseStatus === PARSE_STATUS.PARSE_FAILED && (
        <Tooltip
          overlay={parseErrorTypeDetailName}
          className="ImageOCRProgress__Icon ImageOCRProgress__ErrorIcon"
        >
          <Icon icon="exclamation-circle" />
        </Tooltip>
      )}
    </div>
  );
};
