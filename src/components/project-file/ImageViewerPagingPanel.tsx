import { css } from '@emotion/core';
import { Icon, ImageSelect, useHotKey } from '@/components';
import React from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Tooltip } from '@/components';
import { FC } from '@/interfaces';
import style from '@/style';
import classNames from 'classnames';
import { clearClickEffect, clickEffect } from '@/utils/style';
import { AppState } from '@/store';
import { useSelector } from 'react-redux';

/** 图片浏览器设置面板的属性接口 */
interface ImageViewerPagingPanelProps {
  targetID: string;
  currentImageID: string;
  prevImageID?: string;
  nextImageID?: string;
  loading?: boolean;
  disibled?: boolean;
  className?: string;
}
/**
 * 图片浏览器设置面板
 */
export const ImageViewerPagingPanel: FC<ImageViewerPagingPanelProps> = ({
  targetID,
  currentImageID,
  prevImageID,
  nextImageID,
  loading = false,
  disibled = false,
  className,
}) => {
  const { formatMessage } = useIntl();
  const history = useHistory();

  const goPrevImage = () => {
    if (prevImageID && !loading && !disibled) {
      goImage(prevImageID);
    }
  };

  const goNextImage = () => {
    if (nextImageID && !loading && !disibled) {
      goImage(nextImageID);
    }
  };

  const goImage = (imageID: string) => {
    history.replace(`/image-translator/${imageID}-${targetID}`);
  };

  // 快捷键 - 上一页
  const goPrevPageHotKeyOptions = useSelector(
    (state: AppState) => state.hotKey.goPrevPage,
  );
  useHotKey(
    {
      disibled: !Boolean(goPrevPageHotKeyOptions[0]),
      ...goPrevPageHotKeyOptions[0],
    },
    goPrevImage,
    [prevImageID, targetID, loading, disibled],
  );
  useHotKey(
    {
      disibled: !Boolean(goPrevPageHotKeyOptions[1]),
      ...goPrevPageHotKeyOptions[1],
    },
    goPrevImage,
    [prevImageID, targetID, loading, disibled],
  );

  // 快捷键 - 下一页
  const goNextPageHotKeyOptions = useSelector(
    (state: AppState) => state.hotKey.goNextPage,
  );
  useHotKey(
    {
      disibled: !Boolean(goNextPageHotKeyOptions[0]),
      ...goNextPageHotKeyOptions[0],
    },
    goNextImage,
    [nextImageID, targetID, loading, disibled],
  );
  useHotKey(
    {
      disibled: !Boolean(goNextPageHotKeyOptions[1]),
      ...goNextPageHotKeyOptions[1],
    },
    goNextImage,
    [nextImageID, targetID, loading, disibled],
  );

  return (
    <div
      className={classNames(className, 'ImageViewerPagingPanel')}
      css={css`
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 40px;
        background-color: #fff;
        border-radius: ${style.borderRadiusBase};
        pointer-events: auto;
        box-shadow: ${style.boxShadowBase};
        .ImageViewerPagingPanel__Buttons {
          display: flex;
          flex-direction: row;
          .ImageViewerPagingPanel__Button {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 40px;
            height: 40px;
            font-size: 16px;
            color: ${style.textColorLighter};
            ${clickEffect(
              css`
                background-color: ${style.widgetButtonHoverBackgroundColor};
              `,
              css`
                color: ${style.widgetButtonActiveColor};
              `,
            )}
            &:first-of-type {
              border-radius: ${style.borderRadiusBase} 0 0
                ${style.borderRadiusBase};
            }
            &:last-child {
              border-radius: 0 ${style.borderRadiusBase}
                ${style.borderRadiusBase} 0;
            }
          }
          .ImageViewerPagingPanel__Button--loading {
            font-size: 14px;
            ${clearClickEffect()};
            cursor: not-allowed;
            color: rgba(172, 172, 172, 0.36);
            &:active {
              color: rgba(172, 172, 172, 0.36);
            }
          }
          .ImageViewerPagingPanel__Button--disabled {
            ${clearClickEffect()};
            cursor: not-allowed;
            color: rgba(172, 172, 172, 0.36);
            &:active {
              color: rgba(172, 172, 172, 0.36);
            }
          }
        }
      `}
    >
      <div
        className="ImageViewerPagingPanel__Buttons"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Tooltip
          title={formatMessage({
            id: 'imageTranslator.imageViewerPagingPanel.prevImage',
          })}
        >
          <div
            className={classNames('ImageViewerPagingPanel__Button', {
              'ImageViewerPagingPanel__Button--disabled':
                !prevImageID || disibled,
              'ImageViewerPagingPanel__Button--loading': loading,
            })}
            onClick={goPrevImage}
          >
            <Icon
              className="ImageViewerPagingPanel__ButtonIcon"
              icon={loading ? 'spinner' : 'caret-left'}
              spin={loading}
            ></Icon>
          </div>
        </Tooltip>
        <ImageSelect
          className="ImageViewerPagingPanel__ImageSelect"
          value={currentImageID}
          onChange={(id) => goImage(id)}
        />
        <Tooltip
          title={formatMessage({
            id: 'imageTranslator.imageViewerPagingPanel.nextImage',
          })}
        >
          <div
            className={classNames('ImageViewerPagingPanel__Button', {
              'ImageViewerPagingPanel__Button--disabled':
                !nextImageID || disibled,
              'ImageViewerPagingPanel__Button--loading': loading,
            })}
            onClick={goNextImage}
          >
            <Icon
              className="ImageViewerPagingPanel__ButtonIcon"
              icon={loading ? 'spinner' : 'caret-right'}
              spin={loading}
            ></Icon>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
