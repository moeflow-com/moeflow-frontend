import { css } from '@emotion/core';
import { Button, Popconfirm } from 'antd';
import TextArea, { TextAreaRef } from 'antd/lib/input/TextArea';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  DebounceStatus, ImageSourceViewerModeControl,
  TranslationUser
} from '..';
import { APITranslation } from '../../apis/translation';
import {
  FC, File, InputDebounceStatus, Source as ISource
} from '../../interfaces';
import { AppState } from '../../store';
import {
  batchSelectTranslationSaga,
  editMyTranslationSaga,
  editProofreadSaga
} from '../../store/source/slice';
import { focusTranslation } from '../../store/translation/slice';
import style from '../../style';
import { getBestTranslation } from '../../utils/source';
import { hover } from '../../utils/style';
import { Source } from './Source';

/** 校对模式的属性接口 */
interface ImageSourceViewerProofreaderProps {
  file?: File;
  sources: ISource[];
  targetID: string;
  className?: string;
}
/**
 * 校对模式
 */
export const ImageSourceViewerProofreader: FC<ImageSourceViewerProofreaderProps> =
  ({ file, sources, targetID, className }) => {
    const dispatch = useDispatch();
    const { formatMessage } = useIntl();
    const platform = useSelector((state: AppState) => state.site.platform);
    const isMobile = platform === 'mobile';
    const domRefs = useRef<(HTMLDivElement | null)[]>([]);
    const translationTextAreaRef = useRef<TextAreaRef>(null);
    const proofreadTextAreaRef = useRef<TextAreaRef>(null);
    const currentUser = useSelector((state: AppState) => state.user);
    const batchSelecting = useSelector(
      (state: AppState) => state.source.batchSelecting
    );
    const focusedSourceID = useSelector(
      (state: AppState) => state.source.focusedSource.id
    );
    const focusedSourceEffects = useSelector(
      (state: AppState) => state.source.focusedSource.effects
    );
    const focusedSourceNoiseFocusInput = useSelector(
      (state: AppState) => state.source.focusedSource.noises.focusInput
    );
    const focusedSourceNoiseScrollIntoView = useSelector(
      (state: AppState) => state.source.focusedSource.noises.scrollIntoView
    );
    const focusedSourceIndex = sources.findIndex(
      (source) => source.id === focusedSourceID
    );
    const focusedTranslationID = useSelector(
      (state: AppState) => state.translation.focusedTranslation.id
    );
    const focusedSource = sources.find(
      (source) => source.id === focusedSourceID
    );
    const focusedSourceCreating = focusedSource?.labelStatus === 'creating';
    const focusedSourceDeleting = focusedSource?.labelStatus === 'deleting';
    let focusedSourceAllTranslations: APITranslation[] = [];
    if (focusedSource?.translations) {
      focusedSourceAllTranslations = [...focusedSource.translations];
    }
    if (focusedSource?.myTranslation) {
      focusedSourceAllTranslations.push(focusedSource.myTranslation);
    }
    const focusedTranslation = focusedSourceAllTranslations.find(
      (translation) => translation.id === focusedTranslationID
    );
    const isMyTranslation = focusedTranslation?.user?.id === currentUser.id;
    const isNoTranslation =
      !!focusedSourceID &&
      (!focusedTranslationID ||
        (focusedTranslation?.content === '' &&
          focusedTranslation?.proofreadContent === ''));

    let mergedStatus: InputDebounceStatus | undefined;
    const isMergedStatus = (status: InputDebounceStatus | undefined) =>
      focusedSource?.proodreadContentStatuses[focusedTranslationID] ===
        status ||
      ((isMyTranslation || isNoTranslation) &&
        focusedSource?.myTranslationContentStatus === status);
    if (isMergedStatus('saveFailed')) {
      mergedStatus = 'saveFailed';
    } else if (isMergedStatus('debouncing')) {
      mergedStatus = 'debouncing';
    } else if (isMergedStatus('saving')) {
      mergedStatus = 'saving';
    } else if (isMergedStatus('saveSuccessful')) {
      mergedStatus = 'saveSuccessful';
    } else {
      mergedStatus = undefined;
    }

    const responsiveHeight = isMobile ? 60 : 250;

    const bottomHeight = focusedSource ? responsiveHeight : 0;

    const isNoTranslationRef = useRef(isNoTranslation);
    isNoTranslationRef.current = isNoTranslation;
    useEffect(() => {
      if (focusedSourceEffects.includes('focusInput')) {
        setTimeout(() => {
          if (isNoTranslationRef.current) {
            translationTextAreaRef.current?.focus({ cursor: 'end' });
          } else {
            proofreadTextAreaRef.current?.focus({ cursor: 'end' });
          }
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusedSourceID, focusedSourceNoiseFocusInput]);

    useEffect(() => {
      if (focusedSourceEffects.includes('scrollIntoView')) {
        domRefs.current[focusedSourceIndex]?.scrollIntoView({
          block: 'end',
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [focusedSourceID, focusedSourceNoiseScrollIntoView]);

    const handleTranslationContentChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const content = e.target.value;
      if (content === '' && !focusedTranslation?.proofreadContent) {
        dispatch(focusTranslation({ id: '' }));
      }
      dispatch(
        editMyTranslationSaga({
          sourceID: focusedSourceID,
          targetID,
          content,
          focus: true,
        })
      );
    };

    const handleProofreadContentChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
      const proofreadContent = e.target.value;
      dispatch(
        editProofreadSaga({
          sourceID: focusedSourceID,
          translationID: focusedTranslationID,
          proofreadContent,
        })
      );
    };

    const cloneTranslationContent = () => {
      if (focusedTranslation?.content) {
        handleProofreadContentChange({
          target: {
            value: focusedTranslation.content,
          },
        } as any as React.ChangeEvent<HTMLTextAreaElement>);
      }
    };

    const batchSelectTranslation = () => {
      const sourceTranslationIDMap = [];
      for (const source of sources) {
        const bestTranslation = getBestTranslation(source);
        if (bestTranslation && !bestTranslation.selected) {
          sourceTranslationIDMap.push({
            sourceID: source.id,
            translationID: bestTranslation.id,
          });
        }
      }
      if (sourceTranslationIDMap.length > 0) {
        dispatch(
          batchSelectTranslationSaga({
            fileID: file!.id,
            data: sourceTranslationIDMap,
          })
        );
      }
    };

    return (
      <div
        className={classNames(['ImageSourceViewerProofreader', className])}
        css={css`
          height: 100%;
          .ImageSourceViewerProofreader__Translations {
            height: calc(100% - ${bottomHeight}px);
            overflow-y: auto;
          }
          .ImageSourceViewerProofreader__TranslationsBottom {
            padding: 10px 0;
            background-color: ${style.backgroundColorLight};
          }
          .ImageSourceViewerProofreader__TranslationsButtons {
            text-align: center;
          }
          .ImageSourceViewerProofreader__TranslationsButtonsTip {
            text-align: center;
            margin-top: 5px;
            font-size: 12px;
            color: ${style.textColorSecondary};
          }
          .ImageSourceViewerProofreader__Bottom {
            display: flex;
            flex-direction: column;
            height: ${bottomHeight}px;
            border-top: 3px solid ${style.borderColorBase};
          }
          .ImageSourceViewerProofreader__Bottom--noTranslation {
            .ImageSourceViewerProofreader__TranslationArea {
              flex: auto;
              max-height: none;
            }
            .ImageSourceViewerProofreader__FunctionBar,
            .ImageSourceViewerProofreader__TranslationArea {
              background-color: #fff;
            }
            .ImageSourceViewerProofreader__AreaLine,
            .ImageSourceViewerProofreader__ProofreaderArea {
              display: none;
            }
          }
          .ImageSourceViewerProofreader__Bottom--disabled {
            cursor: not-allowed;
            background-color: #f7f7f7;
          }
          .ImageSourceViewerProofreader__Bottom--myTranslation {
            .ImageSourceViewerProofreader__FunctionBar,
            .ImageSourceViewerProofreader__TranslationArea {
              background-color: #fff;
            }
          }
          .ImageSourceViewerProofreader__FunctionBar {
            padding: 5px 5px 0;
            background-color: ${isMobile ? '#fff' : '#f7f7f7'};
            display: flex;
            justify-content: space-between;
          }
          .ImageSourceViewerProofreader__FunctionBarButton {
            margin-right: 6px;
            &,
            button {
              background-color: #fff;
              color: ${style.textColorSecondaryLight};
              border: 1px solid ${style.borderColorBase};
              border-radius: ${style.borderRadiusSm};
              cursor: pointer;
              ${hover(css`
                background-color: #f7f7f7;
              `)};
            }
            &.ant-popover-disabled-compatible-wrapper {
              border: none;
            }
          }
          .ImageSourceViewerProofreader__TranslationArea {
            position: relative;
            display: ${isMobile ? 'none' : 'block'};
            max-height: 78px;
            overflow-y: auto;
            background-color: #f7f7f7;
          }
          .ImageSourceViewerProofreader__AreaLine {
            display: ${isMobile ? 'none' : 'block'};
            height: 0;
            margin-left: 11px;
            border-bottom: 1px dashed ${style.borderColorBase};
          }
          .ImageSourceViewerProofreader__ProofreaderArea {
            position: relative;
            flex: auto;
            width: 100%;
            overflow-y: auto;
          }
          .ImageSourceViewerProofreader__TranslationUser {
            position: absolute;
            top: 6px;
            left: 11px;
          }
          .ImageSourceViewerProofreader__TextDisplay {
            text-indent: 18px;
            white-space: pre-wrap;
            word-break: break-all;
            padding: 7px 11px;
            min-height: 36px;
          }
          .ImageSourceViewerProofreader__TextDisplay--hasAvatar {
            text-indent: 38px;
          }
          .ImageSourceViewerProofreader__TextArea {
            text-indent: 18px;
            border-radius: 0;
            border-width: 0;
            padding: ${isMobile ? '7px 11px 0' : '7px 11px'};
            min-height: 100%;
            resize: none;
            &.ant-input {
              border-right-width: 0px !important;
              outline: 0;
              box-shadow: none;
              background: transparent;
            }
            &.ant-input[disabled] {
              background: transparent;
            }
          }
          .ImageSourceViewerProofreader__TextArea--hasAvatar {
            text-indent: 38px;
          }
        `}
      >
        <div className="ImageSourceViewerProofreader__Translations">
          <ImageSourceViewerModeControl />
          {sources.map((source, index) => (
            <Source
              ref={(ref) => (domRefs.current[index] = ref)}
              source={source}
              index={index}
              key={source.id}
              targetID={targetID}
            />
          ))}
          {file && sources.length > 0 && (
            <div className="ImageSourceViewerProofreader__TranslationsBottom">
              <div className="ImageSourceViewerProofreader__TranslationsButtons">
                <Button
                  loading={batchSelecting}
                  className="ImageSourceViewerProofreader__TranslationsButton"
                  onClick={batchSelectTranslation}
                >
                  {formatMessage({ id: 'imageTranslator.checkAllTranslation' })}
                </Button>
              </div>
              <div className="ImageSourceViewerProofreader__TranslationsButtonsTip">
                {formatMessage({
                  id: 'imageTranslator.checkAllTranslationTip',
                })}
              </div>
            </div>
          )}
        </div>
        {focusedSource && (
          <div
            className={classNames('ImageSourceViewerProofreader__Bottom', {
              'ImageSourceViewerProofreader__Bottom--disabled':
                focusedSourceCreating || focusedSourceDeleting,
              'ImageSourceViewerProofreader__Bottom--noTranslation':
                isNoTranslation,
              'ImageSourceViewerProofreader__Bottom--myTranslation':
                isMyTranslation,
            })}
          >
            <div className="ImageSourceViewerProofreader__FunctionBar">
              <Popconfirm
                title={formatMessage({
                  id: 'translation.copyToProofreadNotEmptyTip',
                })}
                onConfirm={cloneTranslationContent}
                okText={formatMessage({ id: 'translation.cover' })}
                cancelText={formatMessage({ id: 'site.cancel' })}
                disabled={!focusedTranslation?.proofreadContent}
                placement={isMobile ? 'topLeft' : 'top'}
              >
                <button
                  className="ImageSourceViewerProofreader__FunctionBarButton"
                  onClick={() => {
                    if (!focusedTranslation?.proofreadContent) {
                      cloneTranslationContent();
                    }
                  }}
                  disabled={
                    focusedSourceCreating ||
                    focusedSourceDeleting ||
                    isNoTranslation
                  }
                >
                  {formatMessage({
                    id: 'imageTranslator.copyTranslationContent',
                  })}
                </button>
              </Popconfirm>
              <DebounceStatus
                className="ImageSourceViewerProofreader__DebounceStatus"
                status={mergedStatus}
              />
            </div>
            <div className="ImageSourceViewerProofreader__TranslationArea">
              <TranslationUser
                className="ImageSourceViewerProofreader__TranslationUser"
                iconType="translation"
                avatar={focusedTranslation?.user?.avatar}
              />
              {isMyTranslation || isNoTranslation ? (
                <TextArea
                  autoSize
                  className={classNames(
                    'ImageSourceViewerProofreader__TextArea',
                    {
                      'ImageSourceViewerProofreader__TextArea--hasAvatar':
                        focusedTranslation?.user?.avatar,
                    }
                  )}
                  onChange={handleTranslationContentChange}
                  value={focusedTranslation?.content}
                  placeholder={
                    focusedSourceCreating
                      ? formatMessage({ id: 'imageTranslator.sourceCreating' })
                      : focusedSourceDeleting
                      ? formatMessage({ id: 'imageTranslator.sourceDeleting' })
                      : formatMessage({
                          id: 'imageTranslator.translationPlaceholder',
                        })
                  }
                  // 新创建翻译时，focusedTranslation 会是一个 id 为空的虚拟对象，所以这里用 focusedTranslationID 判断
                  disabled={
                    focusedSourceCreating ||
                    focusedSourceDeleting ||
                    focusedSource.proodreadContentStatuses[
                      focusedTranslation?.id || ''
                    ] === 'saving' ||
                    focusedSource.proodreadContentStatuses[
                      focusedTranslation?.id || ''
                    ] === 'debouncing'
                  }
                  ref={translationTextAreaRef}
                ></TextArea>
              ) : (
                <div
                  className={classNames(
                    'ImageSourceViewerProofreader__TextDisplay',
                    {
                      'ImageSourceViewerProofreader__TextDisplay--hasAvatar':
                        focusedTranslation?.user?.avatar,
                    }
                  )}
                >
                  {focusedTranslation?.content}
                </div>
              )}
            </div>
            <div className="ImageSourceViewerProofreader__AreaLine" />
            <div className="ImageSourceViewerProofreader__ProofreaderArea">
              <TranslationUser
                className="ImageSourceViewerProofreader__TranslationUser"
                iconType="proofread"
                avatar={focusedTranslation?.proofreader?.avatar}
              />
              <TextArea
                autoSize
                className={classNames(
                  'ImageSourceViewerProofreader__TextArea',
                  {
                    'ImageSourceViewerProofreader__TextArea--hasAvatar':
                      focusedTranslation?.proofreader?.avatar,
                  }
                )}
                onChange={handleProofreadContentChange}
                value={focusedTranslation?.proofreadContent}
                placeholder={
                  focusedSourceCreating
                    ? formatMessage({ id: 'imageTranslator.sourceCreating' })
                    : focusedSourceDeleting
                    ? formatMessage({ id: 'imageTranslator.sourceDeleting' })
                    : isNoTranslation
                    ? formatMessage({
                        id: 'imageTranslator.noTranslationForProofread',
                      })
                    : formatMessage({
                        id: 'imageTranslator.proofreadPlaceholder',
                      })
                }
                // 新创建翻译时，focusedTranslation 会是一个 id 为空的虚拟对象，所以这里用 focusedTranslationID 判断
                disabled={
                  focusedSourceCreating ||
                  focusedSourceDeleting ||
                  isNoTranslation ||
                  focusedSource.myTranslationContentStatus === 'saving' ||
                  focusedSource.myTranslationContentStatus === 'debouncing'
                }
                ref={proofreadTextAreaRef}
              ></TextArea>
            </div>
          </div>
        )}
      </div>
    );
  };
