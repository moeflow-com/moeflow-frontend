import { css } from '@emotion/core';
import { Icon } from '.';
import { Slider } from 'antd';
import { debounce } from 'lodash-es';
import React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Tooltip } from './Tooltip';
import { AppState } from '../store';
import style from '../style';
import { FC } from '../interfaces';
import { MovableItemBars } from './MovableItemBars';
import { clickEffect } from '../utils/style';

/** 图片浏览器缩放控制面板的属性接口 */
interface ImageViewerZoomPanelProps {
  opacity?: number;
  shrunk?: boolean;
  zoomInImage: (event: React.MouseEvent) => void;
  zoomOutImage: (event: React.MouseEvent) => void;
  zoomImage: (value: number) => void;
  sliderValue: number;
  imageMinScale: number;
  imageMaxScale: number;
  imageScaleStep: number;
  restoreImage: (event: React.MouseEvent) => void;
  zoomImageByAreaWidth: (event: React.MouseEvent) => void;
  zoomImageByAreaHeight: (event: React.MouseEvent) => void;
  className?: string;
}
/**
 * 图片浏览器缩放控制面板
 */
export const ImageViewerZoomPanel: FC<ImageViewerZoomPanelProps> = ({
  opacity = 1,
  shrunk = false,
  zoomInImage,
  zoomOutImage,
  zoomImage,
  sliderValue,
  imageMinScale,
  imageMaxScale,
  imageScaleStep,
  restoreImage,
  zoomImageByAreaWidth,
  zoomImageByAreaHeight,
  className,
}) => {
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const { formatMessage } = useIntl();
  const content = (
    <>
      {/* PC 版控制台拖动区域 */}
      {!isMobile && <MovableItemBars />}
      {/* 手机版收缩按钮 */}
      {isMobile && (
        <div className="ImageViewerZoomPanel__Button ImageViewerZoomPanel__ShrinkButton">
          <Icon className="icon" icon="image"></Icon>
        </div>
      )}
      <div
        className="ImageViewerZoomPanel__Buttons"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Tooltip
          title={formatMessage({
            id: 'imageTranslator.imageViewerZoomPanel.zoomIn',
          })}
        >
          <div
            className="ImageViewerZoomPanel__Button"
            onClick={zoomInImage}
            data-testid="zoomInButton"
          >
            <Icon className="icon" icon="search-plus"></Icon>
          </div>
        </Tooltip>
        <Tooltip
          title={formatMessage({
            id: 'imageTranslator.imageViewerZoomPanel.zoomOut',
          })}
        >
          <div
            className="ImageViewerZoomPanel__Button"
            onClick={zoomOutImage}
            data-testid="zoomOutButton"
          >
            <Icon className="icon" icon="search-minus"></Icon>
          </div>
        </Tooltip>
        {!isMobile && (
          <div className="ImageViewerZoomPanel__Slider">
            <Slider
              onChange={debounce(zoomImage, 1)} // 防抖，只处理延时超过 1ms 的缩放（针对 Firefox for Android 不跟手的问题）
              marks={{ 1: '' }}
              value={sliderValue}
              min={imageMinScale}
              max={imageMaxScale}
              step={imageScaleStep / 5}
              tipFormatter={null}
              vertical={isMobile}
            />
          </div>
        )}
        <Tooltip
          title={formatMessage({
            id: 'imageTranslator.imageViewerZoomPanel.originSize',
          })}
        >
          <div
            className="ImageViewerZoomPanel__Button"
            onClick={restoreImage}
            data-testid="zoomOriginButton"
          >
            <Icon className="icon" icon="sync-alt"></Icon>
          </div>
        </Tooltip>
        <Tooltip
          title={formatMessage({
            id: 'imageTranslator.imageViewerZoomPanel.fixWidth',
          })}
        >
          <div
            className="ImageViewerZoomPanel__Button"
            onClick={zoomImageByAreaWidth}
            data-testid="fixWidthButton"
          >
            <Icon className="icon" icon="arrows-alt-h"></Icon>
          </div>
        </Tooltip>
        <Tooltip
          title={formatMessage({
            id: 'imageTranslator.imageViewerZoomPanel.fixHeight',
          })}
        >
          <div
            className="ImageViewerZoomPanel__Button"
            onClick={zoomImageByAreaHeight}
            data-testid="fixHeightButton"
          >
            <Icon className="icon" icon="arrows-alt-v"></Icon>
          </div>
        </Tooltip>
      </div>
      {/* 手机版收缩按钮指示部位 */}
      {isMobile && (
        <div
          className="ImageViewerZoomPanel__Button ImageViewerZoomPanel__ShrinkArrow"
          onPointerDown={(e) => {
            if (!shrunk) {
              e.stopPropagation();
            }
          }}
        >
          {shrunk ? (
            <Icon className="icon" icon="caret-down"></Icon>
          ) : (
            <Icon className="icon" icon="caret-up"></Icon>
          )}
        </div>
      )}
    </>
  );
  if (isMobile) {
    return (
      <div
        className={className}
        css={css`
          opacity: ${opacity};
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40px;
          background-color: #fff;
          border-radius: ${style.borderRadiusBase};
          pointer-events: auto;
          box-shadow: ${style.boxShadowBase};
          .ImageViewerZoomPanel__Button {
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
            &.ImageViewerZoomPanel__ShrinkButton {
              height: 30px;
              background-color: ${shrunk ? '#fff' : '#eee'};
              border-radius: ${`${style.borderRadiusBase} ${style.borderRadiusBase} 0 0`};
              overflow: hidden;
            }
            &.ImageViewerZoomPanel__ShrinkArrow {
              height: 10px;
              background-color: ${shrunk ? '#fff' : '#eee'};
              border-radius: ${`0 0 ${style.borderRadiusBase} ${style.borderRadiusBase}`};
              overflow: hidden;
            }
          }
          .ImageViewerZoomPanel__Buttons {
            height: ${shrunk ? '0' : '200px'};
            overflow: hidden;
            transition: height ease 100ms;
            will-change: height;
            flex-direction: column;
            .ImageViewerZoomPanel__Slider {
              height: 120px;
              width: 40px;
              padding: 16px 0;
              cursor: auto;
              /* 覆盖 antd 滑动条样式 */
              .ant-slider {
                margin: 0;
                padding: 0 22px 0 18px;
                .ant-slider-rail {
                  background-color: #e1e1e1;
                }
                &:hover {
                  .ant-slider-rail {
                    background-color: #e1e1e1;
                  }
                }
              }
              .ant-slider-track {
                background-color: #666666;
              }
              .ant-slider-handle {
                margin-bottom: 0;
                border: 2px solid #666666;
                &:focus {
                  box-shadow: none;
                }
              }
              .ant-slider-handle-click-focused {
                border: 2px solid #666666;
                box-shadow: none;
              }
              .ant-slider-step {
                .ant-slider-dot-active {
                  border: 2px solid #666666;
                }
              }
            }
          }
        `}
      >
        {content}
      </div>
    );
  } else {
    return (
      <div
        className={className}
        css={css`
          opacity: ${opacity};
          display: flex;
          flex-direction: row;
          align-items: center;
          height: 40px;
          background-color: #fff;
          border-radius: ${style.borderRadiusBase};
          pointer-events: auto;
          box-shadow: ${style.boxShadowBase};
          .ImageViewerZoomPanel__Buttons {
            display: flex;
            flex-direction: row;
            .ImageViewerZoomPanel__Button {
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
              cursor: pointer;
              &:last-child {
                border-radius: 0 ${style.borderRadiusBase}
                  ${style.borderRadiusBase} 0;
              }
            }
            .ImageViewerZoomPanel__Slider {
              width: 120px;
              height: 40px;
              padding: 0 16px;
              cursor: auto;
              /* 覆盖 antd 滑动条样式 */
              .ant-slider {
                margin: 0;
                padding: 18px 0 22px 0;
              }
              .ant-slider-track {
                background-color: #666666;
              }
              .ant-slider-handle {
                border: 2px solid #666666;
                &:focus {
                  box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.06);
                }
              }
              .ant-slider-handle-click-focused {
                border: 2px solid #666666;
                box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.16);
              }
              .ant-slider-step {
                .ant-slider-dot-active {
                  border: 2px solid #666666;
                }
              }
            }
          }
        `}
      >
        {content}
      </div>
    );
  }
};
