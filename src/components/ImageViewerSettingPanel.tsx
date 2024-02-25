import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { Icon } from '.';
import { Tooltip } from '../components';
import { FC } from '../interfaces';
import style from '../style';
import { clickEffect } from '../utils/style';

/** 图片浏览器设置面板的属性接口 */
interface ImageViewerSettingPanelProps {
  onSettingButtonClick?: () => void;
  className?: string;
}
/**
 * 图片浏览器设置面板
 */
export const ImageViewerSettingPanel: FC<ImageViewerSettingPanelProps> = ({
  onSettingButtonClick,
  className,
}) => {
  const { formatMessage } = useIntl();

  return (
    <div
      className={classNames(className, 'ImageViewerSettingPanel')}
      css={css`
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 40px;
        background-color: #fff;
        border-radius: 0 ${style.borderRadiusBase} ${style.borderRadiusBase} 0;
        pointer-events: auto;
        box-shadow: ${style.boxShadowBase};
        .ImageViewerSettingPanel__Buttons {
          display: flex;
          flex-direction: row;
          .ImageViewerSettingPanel__Button {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            ${clickEffect(
              css`
                background-color: ${style.widgetButtonHoverBackgroundColor};
              `,
              css`
                color: ${style.widgetButtonActiveColor};
              `,
            )}
            &:last-child {
              border-radius: 0 ${style.borderRadiusBase}
                ${style.borderRadiusBase} 0;
            }
          }
        }
      `}
    >
      <div
        className="ImageViewerSettingPanel__Buttons"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Tooltip
          title={formatMessage({
            id: 'imageTranslator.imageViewerZoomPanel.setting',
          })}
        >
          <div
            className="ImageViewerSettingPanel__Button ImageViewerSettingPanel__SettingButton"
            data-testid="settingButton"
            onClick={onSettingButtonClick}
          >
            <Icon
              className="ImageViewerSettingPanel__ButtonIcon"
              icon="cog"
            ></Icon>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
