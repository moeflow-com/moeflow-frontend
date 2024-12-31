import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { useSelector } from 'react-redux';
import { FC, File } from '@/interfaces';
import { Source as ISource } from '@/interfaces/source';
import { AppState } from '@/store';
import { TranslationSaveFailed } from './TranslationSaveFailed';
import { ImageSourceViewerGod } from './ImageSourceViewerGod';
import { ImageSourceViewerTranslator } from './ImageSourceViewerTranslator';
import { ImageSourceViewerProofreader } from './ImageSourceViewerProofreader';
import { useIntl } from 'react-intl';

/** 原文列表的属性接口 */
interface ImageSourceViewerProps {
  file?: File;
  sources: ISource[];
  targetID: string;
  loading: boolean;
  className?: string;
}
/**
 * 原文列表
 */
export const ImageSourceViewer: FC<ImageSourceViewerProps> = ({
  file,
  sources,
  targetID,
  loading,
  className,
}) => {
  const platform = useSelector((state: AppState) => state.site.platform);
  const isMobile = platform === 'mobile';
  const mode = useSelector((state: AppState) => state.imageTranslator.mode);
  const { formatMessage } = useIntl();

  return (
    <div
      className={classNames(['ImageSourceViewer', className])}
      css={css`
        background: #fff;
        display: flex;
        flex-direction: column;
        .ImageSourceViewer__List {
          width: 100%;
          height: 100%;
        }
        .ImageSourceViewer__Empty {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}
    >
      {/* TODO: 将这里的 Spin 改成占位符 */}
      {!loading && (
        <>
          <TranslationSaveFailed sources={sources} targetID={targetID} />
          {sources.length > 0 ? (
            <div className="ImageSourceViewer__List">
              {mode === 'god' && (
                <ImageSourceViewerGod sources={sources} targetID={targetID} />
              )}
              {mode === 'translator' && (
                <ImageSourceViewerTranslator
                  sources={sources}
                  targetID={targetID}
                />
              )}
              {mode === 'proofreader' && (
                <ImageSourceViewerProofreader
                  file={file}
                  sources={sources}
                  targetID={targetID}
                />
              )}
            </div>
          ) : isMobile ? (
            <div className="ImageSourceViewer__Empty">
              <div>
                {formatMessage({
                  id: 'imageTranslator.sourceViewer.tapToMarkSource',
                })}
              </div>
              <div>
                {formatMessage({
                  id: 'imageTranslator.sourceViewer.longTapToRemoveMark',
                })}
              </div>
            </div>
          ) : (
            <div className="ImageSourceViewer__Empty">
              <div>
                {formatMessage({
                  id: 'imageTranslator.sourceViewer.leftClickToMarkSource',
                })}
              </div>
              <div>
                {formatMessage({
                  id: 'imageTranslator.sourceViewer.rightClickToMarkSource',
                })}
              </div>
              <div>
                {formatMessage({
                  id: 'imageTranslator.sourceViewer.rightClickMarkToRemove',
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
