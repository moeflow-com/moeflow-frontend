import { css } from '@emotion/core';
import { Checkbox } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import {
  FileUploadProgress,
  Icon,
  ImageOCRProgress,
  TranslationProgress,
} from '.';
import {
  FILE_NOT_EXIST_REASON,
  FILE_SAFE_STATUS,
  IMAGE_COVER,
} from '../constants';
import { FC, File } from '../interfaces';
import style from '../style';
import { cardClickEffect, clickEffect } from '../utils/style';

/** 文件条目的属性接口 */
interface FileItemProps {
  file: File;
  hasTarget: boolean;
  onClick?: () => void;
  selectVisible?: boolean;
  selected?: boolean;
  onSelect?: (value: boolean) => void;
  deleteButtonVisible?: boolean;
  onDeleteButtonClick?: () => void;
  className?: string;
}
/**
 * 文件条目
 */
export const FileItem: FC<FileItemProps> = ({
  file,
  hasTarget,
  onClick,
  selectVisible = false,
  selected = false,
  onSelect,
  deleteButtonVisible = false,
  onDeleteButtonClick,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const sourceCount = file.sourceCount;
  const translatedSourceCount = hasTarget
    ? file.fileTargetCache!.translatedSourceCount
    : file.translatedSourceCount;
  const checkedSourceCount = hasTarget
    ? file.fileTargetCache!.checkedSourceCount
    : file.checkedSourceCount;

  const width = IMAGE_COVER.WIDTH;
  const height = 240;
  const imageHeight = IMAGE_COVER.HEIGHT;

  return (
    <div
      className={classNames(['FileItem', className])}
      css={css`
        position: relative;
        width: ${width}px;
        height: ${height}px;
        border-radius: ${style.borderRadiusBase};
        overflow: hidden;
        transition: box-shadow 100ms, border-color 100ms;
        border: 1px solid ${style.borderColorLight};
        .FileItem__ImageOCRProgressWrapper {
          display: none;
          position: absolute;
          top: ${imageHeight - 17}px;
          left: 6px;
          padding: 3px 5px;
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 4px;
          border: 1px solid #fff;
        }
        .FileItem__ImageWrapper {
          display: block;
          width: ${width - 2}px;
          height: ${imageHeight}px;
          overflow: hidden;
        }
        .FileItem__Image {
          display: block;
          width: ${width - 2}px;
          height: ${imageHeight}px;
          transition: transform 400ms;
          user-select: none;
          /* 禁止 iOS 上 Safari/Chrome/Firefox，重按/长按图片弹出菜单 */
          -webkit-touch-callout: none;
        }
        .FileItem__ImageTip {
          width: 100%;
          height: 100%;
          padding: 20px 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          background-color: #f3f3f3;
          font-weight: bold;
        }
        .FileItem__Name {
          font-size: 14px;
          line-height: 18px;
        }
        .FileItem__SelectWrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: ${style.borderRadiusBase} 0 ${style.borderRadiusBase} 0;
          background-color: rgba(0, 0, 0, 0.04);
          ${clickEffect(
            css`
              background-color: rgba(0, 0, 0, 0.2);
            `,
            css`
              background-color: rgba(0, 0, 0, 0.4);
            `
          )};
        }
        .FileItem__Select {
          padding: 7px 10px;
        }
        .FileItem__DeleteButton {
          position: absolute;
          top: 0;
          right: 0;
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 0 ${style.borderRadiusBase} 0 ${style.borderRadiusBase};
          background-color: rgba(0, 0, 0, 0.04);
          ${clickEffect(
            css`
              background-color: rgba(0, 0, 0, 0.2);
            `,
            css`
              background-color: rgba(0, 0, 0, 0.4);
            `
          )};
        }
        .FileItem__DeleteButtonIcon {
          width: 18px;
          height: 18px;
          color: rgba(255, 255, 255, 0.8);
        }
        .FileItem__Info {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: ${height - imageHeight - 2}px;
          padding: 10px;
        }
        .FileItem__Name {
          height: 36px;
          overflow: hidden;
          word-break: break-all;
        }
        ${cardClickEffect()};
        ${clickEffect(
          css`
            .FileItem__Image {
              transform: scale(1.1);
            }
          `,
          css`
            .FileItem__Image {
              transform: scale(1.08);
              transition: transform 100ms;
            }
          `
        )};
      `}
      onClick={onClick}
    >
      <div className="FileItem__ImageWrapper">
        {file.coverUrl === 'generating' ? (
          <div className="FileItem__ImageTip">
            {formatMessage({ id: 'file.generating' })}
          </div>
        ) : file.safeStatus === FILE_SAFE_STATUS.BLOCK ? (
          <div className="FileItem__ImageTip">
            {formatMessage({ id: 'file.blockTip' })}
          </div>
        ) : file.fileNotExistReason === FILE_NOT_EXIST_REASON.NOT_UPLOAD ? (
          <div className="FileItem__ImageTip">
            {formatMessage({ id: 'file.needUploadTip' })}
          </div>
        ) : (
          <img
            className="FileItem__Image"
            alt={file.name}
            src={file.coverUrl}
            draggable={false} // 禁止浏览器拖拽图片
            onDragStart={(e) => e.preventDefault()} // 禁止 Firefox 拖拽图片（Firefox 仅 drageable={false} 无效）
            onContextMenu={(e) => e.preventDefault()} // 禁止鼠标右键菜单 和 Android 上 Chrome/Firefox，重按/长按图片弹出菜单
          />
        )}
      </div>
      {selectVisible && (
        <div
          className="FileItem__SelectWrapper"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Checkbox
            className="FileItem__Select"
            checked={selected}
            onChange={(e) => {
              onSelect?.(e.target.checked);
            }}
          ></Checkbox>
        </div>
      )}
      {deleteButtonVisible && (
        <div
          className="FileItem__DeleteButton"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteButtonClick?.();
          }}
        >
          <Icon className="FileItem__DeleteButtonIcon" icon="times" />
        </div>
      )}
      <div className="FileItem__Info">
        <div className="FileItem__Name">{file.name}</div>

        {file.uploading ? (
          <FileUploadProgress file={file} />
        ) : (
          <>
            <TranslationProgress
              className="FileItem__TranslationProgressText"
              sourceCount={sourceCount}
              translatedSourceCount={translatedSourceCount}
              checkedSourceCount={checkedSourceCount}
              type="text"
            />
            <TranslationProgress
              className="FileItem__TranslationProgressLine"
              sourceCount={sourceCount}
              translatedSourceCount={translatedSourceCount}
              checkedSourceCount={checkedSourceCount}
              type="line"
            />
          </>
        )}
      </div>
      <div className="FileItem__ImageOCRProgressWrapper">
        <ImageOCRProgress
          className="FileItem__ImageOCRProgress"
          parseStatus={file.parseStatus}
          parseStatusName={file.parseStatusDetailName}
          parseErrorTypeDetailName={file.parseErrorTypeDetailName}
          percent={file.imageOcrPercent}
          percentName={file.imageOcrPercentDetailName}
        />
      </div>
    </div>
  );
};
