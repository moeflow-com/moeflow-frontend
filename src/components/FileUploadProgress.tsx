import { css } from '@emotion/core';
import { Icon } from '.';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { FC, File } from '../interfaces';
import style from '../style';
/** 文件上传进度的属性接口 */
interface FileUploadProgressProps {
  file: File;
  className?: string;
}
/**
 * 文件翻译/上传进度
 */
export const FileUploadProgress: FC<FileUploadProgressProps> = ({
  file,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n

  return (
    <div
      className={classNames('FileUploadProgress', className)}
      css={css`
        display: flex;
        flex-direction: column;
        .FileUploadProgress__Progress {
          position: relative;
          width: 100%;
          height: 10px;
          background: #efefef;
          border-radius: ${style.borderRadiusBase};
        }
        .FileUploadProgress__ProgressLine {
          position: absolute;
          left: 0;
          top: 0;
          height: 10px;
          border-radius: ${style.borderRadiusBase};
        }
        .FileUploadProgress__ProgressUpload {
          background: ${style.successColor};
        }
        .FileUploadProgress__TextProgress {
          flex: none;
          font-size: 12px;
          margin-bottom: 6px;
        }
        .FileUploadProgress__TextProgressItem {
          margin-right: 8px;
          .FileUploadProgress__TextProgressItemIcon {
            margin-right: 4px;
            color: ${style.textColorSecondary};
          }
        }
      `}
    >
      <div className="FileUploadProgress__TextProgress">
        {file.uploadState === 'uploading' && (
          <span className="FileUploadProgress__TextProgressItem">
            <Icon
              icon="cloud-upload-alt"
              className="FileUploadProgress__TextProgressItemIcon"
            />
            {formatMessage({ id: 'file.uploading' })} {file.uploadPercent}%
          </span>
        )}
        {file.uploadState === 'success' && (
          <span className="FileUploadProgress__TextProgressItem">
            <Icon
              icon="cloud"
              className="FileUploadProgress__TextProgressItemIcon"
            />
            {formatMessage({ id: 'file.uploadSuccess' })}
            {file.uploadOverwrite &&
              ` - ${formatMessage({ id: 'file.uploadOverwrite' })}`}
          </span>
        )}
        {file.uploadState === 'failure' && (
          <span className="FileUploadProgress__TextProgressItem">
            <Icon
              icon="exclamation-circle"
              className="FileUploadProgress__TextProgressItemIcon"
            />
            {formatMessage({ id: 'file.uploadFailure' })}
          </span>
        )}
      </div>
      {file.uploadState === 'uploading' && (
        <div className="FileUploadProgress__Progress">
          <div
            className="FileUploadProgress__ProgressLine FileUploadProgress__ProgressUpload"
            style={{ width: `${file.uploadPercent}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
