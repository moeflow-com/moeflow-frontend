import { css } from '@emotion/core';
import { Checkbox } from 'antd';
import classNames from 'classnames';
import { clearFix, darken } from 'polished';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { DebounceStatus, Icon, Tooltip } from '..';
import { APITranslation } from '../../apis/translation';
import { Source as ISource } from '../../interfaces';
import { AppState } from '../../store';
import { focusSource, selectTranslationSaga } from '../../store/source/slice';
import { focusTranslation } from '../../store/translation/slice';
import style from '../../style';
import { getSortedTranslations } from '../../utils/source';
import { clickEffect, hover } from '../../utils/style';

/** 原文的属性接口 */
interface SourceProps {
  source: ISource;
  index: number;
  targetID: string;
  className?: string;
}
/**
 * 原文
 */
const SourceWithoutRef: React.ForwardRefRenderFunction<
  HTMLDivElement,
  SourceProps
> = ({ source, index, className }, ref) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: AppState) => state.user);
  const focusedSourceID = useSelector(
    (state: AppState) => state.source.focusedSource.id
  );
  const focusedTranslationID = useSelector(
    (state: AppState) => state.translation.focusedTranslation.id
  );
  const batchSelecting = useSelector(
    (state: AppState) => state.source.batchSelecting
  );
  const translations = getSortedTranslations(source);
  const hasSelectedTranslation =
    translations.findIndex((translation) => translation.selected) > -1;

  useEffect(() => {
    if (
      focusedSourceID === source.id &&
      !translations.find(
        (translation) => translation.id === focusedTranslationID
      )
    ) {
      if (translations.length > 0) {
        dispatch(
          focusTranslation({
            id: translations[0].id,
          })
        );
      } else {
        dispatch(
          focusTranslation({
            id: '',
          })
        );
      }
    }
  });

  const handleFocusSource = () => {
    dispatch(
      focusSource({
        id: source.id,
        effects: ['focusLabel', 'focusInput'],
        noises: ['focusInput'],
      })
    );
  };

  const handleFocusTranslation = (translation: APITranslation) => {
    handleFocusSource();
    dispatch(
      focusTranslation({
        id: translation.id,
      })
    );
  };

  const handleSelectTranslation = (translation: APITranslation) => {
    handleFocusTranslation(translation);
    dispatch(
      selectTranslationSaga({
        sourceID: source.id,
        translationID: translation.id,
        selected: !translation.selected,
      })
    );
  };

  return (
    <div
      className={classNames('ImageSourceViewerProofreaderSource', className, {
        'ImageSourceViewerProofreaderSource--noTranslation':
          translations.length === 0,
        'ImageSourceViewerProofreaderSource--hasSelectedTranslation':
          hasSelectedTranslation,
      })}
      css={css`
        position: relative;
        display: flex;
        border-bottom: 1px solid ${style.borderColorBase};
        border-left: 5px solid ${style.primaryColorLightest};
        min-height: 32px;
        :last-child {
          border-bottom: 0;
        }
        &.ImageSourceViewerProofreaderSource--hasSelectedTranslation {
          border-left: 5px solid ${style.borderColorLight};
          .ImageSourceViewerProofreaderSource__TranslationContent,
          .ImageSourceViewerProofreaderSource__TranslationContentProofread {
            color: ${style.textColorSecondary};
          }
          .ImageSourceViewerProofreaderSource__TranslationContentProofreadPrefixIcon {
            color: ${style.textColorSecondaryLighter};
          }
          .ImageSourceViewerProofreaderSource__Translation {
            :first-of-type {
              .ImageSourceViewerProofreaderSource__TranslationContent,
              .ImageSourceViewerProofreaderSource__TranslationContentProofread {
                color: ${style.textColor};
              }
              .ImageSourceViewerProofreaderSource__TranslationContentProofreadPrefixIcon {
                color: ${style.textColorSecondary};
              }
            }
          }
          .ImageSourceViewerProofreaderSource__Translation--hasProofread {
            :first-of-type {
              .ImageSourceViewerProofreaderSource__TranslationContent {
                color: ${style.textColorSecondary};
              }
            }
          }
          .ImageSourceViewerProofreaderSource__Translation,
          .ImageSourceViewerProofreaderSource__Translation--hasProofread {
            ${hover(css`
              .ImageSourceViewerProofreaderSource__TranslationContent,
              .ImageSourceViewerProofreaderSource__TranslationContentProofread {
                color: ${style.textColor};
              }
              .ImageSourceViewerProofreaderSource__TranslationContentProofreadPrefixIcon {
                color: ${style.textColorSecondary};
              }
            `)};
          }
        }
        &.ImageSourceViewerProofreaderSource--noTranslation {
          .ImageSourceViewerProofreaderSource__TranslationContent {
            color: ${style.textColorSecondary};
          }
        }
        .ImageSourceViewerProofreaderSource__Index {
          position: absolute;
          top: 5px;
          left: 9px;
          color: ${style.textColorSecondary};
          font-size: 14px;
          font-family: ${style.labelFontFamily};
          font-weight: 600;
          min-width: 17px;
          text-align: center;
          pointer-events: none;
        }
        .ImageSourceViewerProofreaderSource__Translations {
          flex: auto;
        }
        .ImageSourceViewerProofreaderSource__Translation {
          display: flex;
          justify-content: stretch;
          align-items: stretch;
          border-bottom: 1px solid ${style.borderColorBase};
          border-left: 1px solid ${style.borderColorBase};
          margin-left: 33px;
          :last-child {
            border-bottom: 0;
          }
          :first-of-type {
            border-left: 0;
            margin-left: 0;
            padding-left: 0;
            .ImageSourceViewerProofreaderSource__TranslationContent {
              padding-left: 32px;
            }
            .ImageSourceViewerProofreaderSource__TranslationContentProofread {
              margin-left: 32px;
            }
          }
        }
        .ImageSourceViewerProofreaderSource__Translation--focus {
          background-color: ${style.backgroundFocus};
        }
        .ImageSourceViewerProofreaderSource__Translation--hasProofread {
          .ImageSourceViewerProofreaderSource__TranslationContent {
            min-height: 30px;
          }
        }
        .ImageSourceViewerProofreaderSource__TranslationContentWrapper {
          flex: auto;
          color: ${style.textColor};
          ${clickEffect()};
        }
        .ImageSourceViewerProofreaderSource__TranslationContent {
          width: 100%;
          padding: 4px 5px;
          white-space: pre-wrap;
          word-break: break-all;
          min-height: 31px;
          ${clearFix()}
        }
        .ImageSourceViewerProofreaderSource__TranslationContentProofread {
          padding: 4px 0;
          margin: 0 5px;
          border-top: 1px dashed ${darken(0.03, style.borderColorBase)};
          white-space: pre-wrap;
          word-break: break-all;
        }
        .ImageSourceViewerProofreaderSource__TranslationContentProofreadPrefix {
          margin-right: 4px;
        }
        .ImageSourceViewerProofreaderSource__TranslationContentProofreadPrefixIcon {
          width: 12px;
          color: ${style.textColorSecondary};
        }
        .ImageSourceViewerProofreaderSource__SingleDebounceStatus {
          float: right;
          margin-right: 3px;
        }
        .ImageSourceViewerProofreaderSource__TranslationCheckbox {
          display: flex;
          justify-content: stretch;
          align-items: stretch;
          ${clickEffect()};
          .ant-checkbox-wrapper {
            flex: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 10px;
            .ant-checkbox {
              top: 0;
            }
            .ant-checkbox-checked .ant-checkbox-inner {
              background-color: #8c8c8c;
              border-color: #8c8c8c;
            }
            .ant-checkbox-checked::after {
              border-color: #8c8c8c;
            }
          }
          .ant-checkbox-wrapper:hover .ant-checkbox-inner,
          .ant-checkbox:hover .ant-checkbox-inner {
            border-color: #8c8c8c;
          }
          .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #dbdbdb;
          }
        }
      `}
    >
      <div className="ImageSourceViewerProofreaderSource__Index">
        {index + 1}
      </div>
      <div
        className="ImageSourceViewerProofreaderSource__Translations"
        ref={ref}
      >
        {translations.length > 0 ? (
          translations.map((translation) => {
            if (!translation.content && !translation.proofreadContent) {
              return '';
            }
            const isMyTranslation = translation?.user?.id === currentUser.id;
            const isNoTranslation =
              !!focusedSourceID &&
              (!focusedTranslationID ||
                (translation?.content === '' &&
                  translation?.proofreadContent === ''));
            return (
              <div
                key={translation.id}
                className={classNames(
                  'ImageSourceViewerProofreaderSource__Translation',
                  {
                    'ImageSourceViewerProofreaderSource__Translation--hasProofread':
                      translation.proofreadContent,
                    'ImageSourceViewerProofreaderSource__Translation--focus':
                      source.id === focusedSourceID &&
                      translation.id === focusedTranslationID,
                  }
                )}
              >
                <div
                  className="ImageSourceViewerProofreaderSource__TranslationContentWrapper"
                  onClick={() => {
                    handleFocusTranslation(translation);
                  }}
                >
                  <div className="ImageSourceViewerProofreaderSource__TranslationContent">
                    {translation.content}
                    {(isMyTranslation || isNoTranslation) && (
                      <DebounceStatus
                        className="ImageSourceViewerProofreaderSource__SingleDebounceStatus"
                        status={source.myTranslationContentStatus}
                        tipVisible={false}
                      />
                    )}
                  </div>
                  {translation.proofreadContent && (
                    <div className="ImageSourceViewerProofreaderSource__TranslationContentProofread">
                      <Tooltip
                        title={formatMessage({
                          id: 'translation.proofreadFirstTip',
                        })}
                        placement="left"
                      >
                        <span className="ImageSourceViewerProofreaderSource__TranslationContentProofreadPrefix">
                          <Icon
                            className="ImageSourceViewerProofreaderSource__TranslationContentProofreadPrefixIcon"
                            icon="pen-nib"
                          />
                        </span>
                      </Tooltip>
                      {translation.proofreadContent}
                      <DebounceStatus
                        className="ImageSourceViewerProofreaderSource__SingleDebounceStatus"
                        status={source.proodreadContentStatuses[translation.id]}
                        tipVisible={false}
                      />
                    </div>
                  )}
                </div>
                <div
                  className="ImageSourceViewerProofreaderSource__TranslationCheckbox"
                  onClick={() => {
                    if (!source.selecting) {
                      handleSelectTranslation(translation);
                    }
                  }}
                >
                  <Checkbox
                    checked={translation.selected}
                    disabled={source.selecting || batchSelecting}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={classNames(
              'ImageSourceViewerProofreaderSource__Translation',
              {
                'ImageSourceViewerProofreaderSource__Translation--focus':
                  source.id === focusedSourceID,
              }
            )}
          >
            <div
              className="ImageSourceViewerProofreaderSource__TranslationContentWrapper"
              onClick={() => {
                handleFocusSource();
              }}
            >
              <div className="ImageSourceViewerProofreaderSource__TranslationContent">
                [{formatMessage({ id: 'label.defaultContent' })}]
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Source = React.forwardRef(SourceWithoutRef);
