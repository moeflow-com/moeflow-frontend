import { css } from '@emotion/core';
import { Checkbox, Popconfirm } from 'antd';
import TextArea, { TextAreaProps, TextAreaRef } from 'antd/lib/input/TextArea';
import classNames from 'classnames';
import { lighten } from 'polished';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { DebounceStatus, Icon, Tooltip, TranslationUser } from '@/components';
import { PROJECT_PERMISSION } from '@/constants';
import { FC, Source } from '@/interfaces';
import { Translation as ITranslation } from '@/interfaces/translation';
import { AppState } from '@/store';
import {
  editMyTranslationSaga,
  editProofreadSaga,
  selectTranslationSaga,
} from '@/store/source/slice';
import style from '@/style';
import { clearClickEffect, clickEffect } from '@/utils/style';
import { can } from '@/utils/user';

export interface OnTextAreaChange {
  (event: React.ChangeEvent<HTMLTextAreaElement>): void;
}
/** 翻译内容的属性接口 */
interface TranslationProps {
  source: Source;
  targetID: string;
  translation?: ITranslation;
  mine: boolean;
  myTranslation?: ITranslation; // 仅当 mine!==true 时提供
  textAreaRef?:
    | ((instance: TextAreaRef | null) => void)
    | React.RefObject<TextAreaRef>
    | null
    | undefined;
  textAreaProps?: TextAreaProps;
  proofreadEditable?: boolean;
  proofreadTextAreaRef?:
    | ((instance: TextAreaRef | null) => void)
    | React.RefObject<TextAreaRef>
    | null
    | undefined;
  proofreadTextAreaProps?: TextAreaProps;
  className?: string;
}
/**
 * 翻译内容
 */
export const Translation: FC<TranslationProps> = ({
  source,
  targetID,
  translation,
  mine,
  myTranslation,
  textAreaRef,
  textAreaProps,
  proofreadEditable = false,
  proofreadTextAreaRef,
  proofreadTextAreaProps,
  className,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const userName = useSelector((state: AppState) => state.user.name);
  const userAvatar = useSelector((state: AppState) => state.user.avatar);
  const myTranslationContentStatus = mine
    ? source.myTranslationContentStatus
    : undefined;
  const proofreadContentStatus =
    translation && source.proodreadContentStatuses[translation.id];
  const [translationContent, setTranslationContent] = useState(
    translation?.content,
  );
  const [proofreadContent, setProofreadContent] = useState(
    translation?.proofreadContent,
  );
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );

  useEffect(() => {
    setTranslationContent(translation?.content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translation?.content]);

  const handleMyTranslationContentChange: OnTextAreaChange = (e) => {
    setTranslationContent(e.target.value);
    dispatch(
      editMyTranslationSaga({
        sourceID: source.id,
        targetID,
        content: e.target.value,
      }),
    );
  };

  const handleProofreadContentChange: OnTextAreaChange = (e) => {
    setProofreadContent(e.target.value);
    dispatch(
      editProofreadSaga({
        sourceID: source.id,
        translationID: translation!.id,
        proofreadContent: e.target.value,
      }),
    );
  };

  const copyToProofread = () => {
    if (translationContent) {
      handleProofreadContentChange({
        target: {
          value: translationContent,
        },
      } as any as React.ChangeEvent<HTMLTextAreaElement>);
    }
  };

  const copyToMyTranslation = (content: string) => {
    dispatch(
      editMyTranslationSaga({
        sourceID: source.id,
        targetID,
        content: content,
      }),
    );
  };

  const handleSelectTranslation = () => {
    dispatch(
      selectTranslationSaga({
        sourceID: source.id,
        translationID: translation!.id,
        selected: !translation!.selected,
      }),
    );
  };

  // const proofreaded = Boolean(translation?.proofreadContent);
  // let proofreadButtonText = '';
  // if (proofreaded) {
  //   proofreadButtonText += formatMessage({ id: 'translation.proofreaded' });
  // } else {
  //   proofreadButtonText += formatMessage({ id: 'translation.noNeedproofread' });
  // }

  // const translations = [...source.translations];
  // if (source.myTranslation) {
  //   translations.unshift(source.myTranslation);
  // }
  // const validTranslation = filterValidTranslations(translations);
  // if (validTranslation.length > 1) {
  //   proofreadButtonText += ', ' + formatMessage({ id: 'translation.asBest' });
  // }

  return (
    <div
      className={classNames('Translation', className, {
        'Translation--mine': mine,
      })}
      css={css`
        display: flex;
        flex-direction: column;
        align-items: stretch;
        .Translation__ContentDiv,
        .Translation__ProofreadContentDiv {
          white-space: pre-wrap;
          word-break: break-all;
        }
        .Translation__ContentDiv--empty,
        .Translation__ProofreadContentDiv--empty {
          color: ${style.textColorSecondary};
        }
        .Translation__ContentTextArea {
          border-radius: ${style.borderRadiusSm};
          resize: none;
        }
        .Translation__ProofreadContentTextArea {
          border-radius: ${style.borderRadiusSm};
          resize: none;
        }
        .Translation__User {
          display: flex;
          align-items: center;
          min-height: 24px;
        }
        .Translation__DebounceStatus {
          margin-left: auto;
          margin-right: 2px;
        }
        .Translation__ContentClone {
          flex: none;
          font-size: 12px;
          cursor: pointer;
          color: #ffdade;
          user-select: none;
          margin-right: 3px;
          &:hover {
            color: ${style.primaryColor};
          }
          &:active {
            color: ${lighten(0.15, style.primaryColor)};
          }
        }
        .Translation__ContentCloneIcon {
          margin-right: 2px;
        }
        .Translation__Bottom {
          display: flex;
          justify-content: flex-end;
          margin-top: 5px;
        }
        .Translation__Buttons {
          display: flex;
          justify-content: flex-end;
        }
        .Translation__TranslationCheckbox {
          min-width: 32px;
          height: 32px;
          display: flex;
          justify-content: stretch;
          align-items: stretch;
          border-radius: ${style.borderRadiusBase};
          ${clickEffect()};
          &.Translation__TranslationCheckbox--disabled {
            ${clearClickEffect()};
            .ant-checkbox-wrapper {
              cursor: initial;
            }
            .ant-checkbox-input {
              cursor: not-allowed;
            }
          }
          .ant-checkbox-wrapper {
            flex: auto;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 8px;
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
        .Translation__SelectText {
          font-size: 12px;
          color: ${style.textColorSecondary};
        }
        .Translation__SelectIcon {
          display: none;
          height: 12px;
          margin-right: 4px;
        }
      `}
    >
      {/* 翻译部分 */}
      <div className="Translation__User">
        <TranslationUser
          iconType="translation"
          avatar={mine ? userAvatar : translation?.user?.avatar}
          name={mine ? userName : translation?.user?.name}
        />
        {translation?.id &&
          translation?.content &&
          can(currentProject, PROJECT_PERMISSION.PROOFREAD_TRA) && (
            <Tooltip
              title={formatMessage({ id: 'translation.copyToProofread' })}
              placement="top"
              align={{ offset: [0, 1] }}
            >
              <Popconfirm
                title={formatMessage({
                  id: 'translation.copyToProofreadNotEmptyTip',
                })}
                onConfirm={copyToProofread}
                okText={formatMessage({ id: 'translation.cover' })}
                cancelText={formatMessage({ id: 'site.cancel' })}
                disabled={!proofreadContent}
                placement="top"
              >
                <div
                  className="Translation__ContentClone"
                  onClick={() => {
                    !proofreadContent && copyToProofread();
                  }}
                >
                  <Icon
                    className="Translation__ContentCloneIcon"
                    icon="paste"
                  />
                  <Icon
                    className="Translation__ContentCloneIcon"
                    icon="angle-double-down"
                  />
                </div>
              </Popconfirm>
            </Tooltip>
          )}
        {!mine &&
          translation?.content &&
          can(currentProject, PROJECT_PERMISSION.ADD_TRA) && (
            <Tooltip
              title={formatMessage({
                id: 'translation.copyToMyTranslation',
              })}
              placement="top"
              align={{ offset: [0, 1] }}
            >
              <Popconfirm
                title={formatMessage({
                  id: 'translation.copyToMyTranslationNotEmptyTip',
                })}
                onConfirm={() => {
                  copyToMyTranslation(translation?.content);
                }}
                okText={formatMessage({ id: 'translation.cover' })}
                cancelText={formatMessage({ id: 'site.cancel' })}
                disabled={!myTranslation?.content}
                placement="top"
              >
                <div
                  className="Translation__ContentClone"
                  onClick={() => {
                    !myTranslation?.content &&
                      copyToMyTranslation(translation?.content);
                  }}
                >
                  <Icon
                    className="Translation__ContentCloneIcon"
                    icon="paste"
                  />
                  <Icon
                    className="Translation__ContentCloneIcon"
                    icon="angle-double-up"
                  />
                </div>
              </Popconfirm>
            </Tooltip>
          )}
        <DebounceStatus
          className="Translation__DebounceStatus"
          status={myTranslationContentStatus}
        />
      </div>
      <div className="Translation__Translation">
        {mine && can(currentProject, PROJECT_PERMISSION.ADD_TRA) ? (
          <TextArea
            prefix="s"
            className="Translation__ContentTextArea"
            ref={textAreaRef}
            autoSize={true}
            placeholder={formatMessage({
              id: 'imageTranslator.translationPlaceholder',
            })}
            value={translationContent}
            onChange={handleMyTranslationContentChange}
            {...textAreaProps}
          />
        ) : (
          <div
            className={classNames('Translation__ContentDiv', {
              'Translation__ContentDiv--empty': !Boolean(translation?.content),
            })}
          >
            {translation?.content || (
              <>
                <Icon className="Translation__TextPrefixIcon" icon="ban"></Icon>
                {formatMessage({ id: 'label.emptyContent' })}
              </>
            )}
          </div>
        )}
      </div>
      {/* 校对部分 */}
      {translation?.id &&
        ((translation?.content &&
          can(currentProject, PROJECT_PERMISSION.PROOFREAD_TRA)) ||
          translation?.proofreadContent) && (
          <div className="Translation__User">
            <TranslationUser
              iconType="proofread"
              iconTooltip={
                translation?.proofreader
                  ? formatMessage({
                      id: 'translation.proofreadFirstTip',
                    })
                  : undefined
              }
              name={
                translation?.proofreader
                  ? translation.proofreader.name
                  : formatMessage({ id: 'translation.pendingProofread' })
              }
              avatar={translation.proofreader?.avatar}
            />
            {!mine &&
              proofreadContent &&
              can(currentProject, PROJECT_PERMISSION.ADD_TRA) && (
                <Tooltip
                  title={formatMessage({
                    id: 'translation.copyToMyTranslation',
                  })}
                  placement="top"
                  align={{ offset: [0, 1] }}
                >
                  <Popconfirm
                    title={formatMessage({
                      id: 'translation.copyToMyTranslationNotEmptyTip',
                    })}
                    onConfirm={() => {
                      copyToMyTranslation(proofreadContent);
                    }}
                    okText={formatMessage({ id: 'translation.cover' })}
                    cancelText={formatMessage({ id: 'site.cancel' })}
                    disabled={!myTranslation?.content}
                    placement="top"
                  >
                    <div
                      className="Translation__ContentClone"
                      onClick={() => {
                        !myTranslation?.content &&
                          copyToMyTranslation(proofreadContent);
                      }}
                    >
                      <Icon
                        className="Translation__ContentCloneIcon"
                        icon="paste"
                      />
                      <Icon
                        className="Translation__ContentCloneIcon"
                        icon="angle-double-up"
                      />
                    </div>
                  </Popconfirm>
                </Tooltip>
              )}
            <DebounceStatus
              className="Translation__DebounceStatus"
              status={proofreadContentStatus}
            />
          </div>
        )}
      {translation?.id &&
        (translation?.content || translation?.proofreadContent) && (
          <div className="Translation__Proofread">
            {proofreadEditable &&
            can(currentProject, PROJECT_PERMISSION.PROOFREAD_TRA) ? (
              <TextArea
                className="Translation__ProofreadContentTextArea"
                ref={proofreadTextAreaRef}
                autoSize={true}
                placeholder={formatMessage({
                  id: 'imageTranslator.proofreadPlaceholder',
                })}
                value={proofreadContent}
                onChange={handleProofreadContentChange}
                {...proofreadTextAreaProps}
              />
            ) : (
              <div
                className={classNames('Translation__ProofreadContentDiv', {
                  'Translation__ProofreadContentDiv--empty': !Boolean(
                    translation.proofreadContent,
                  ),
                })}
              >
                {translation.proofreadContent}
              </div>
            )}
          </div>
        )}
      {/* 翻译信息 / 按钮部分 */}
      <div className="Translation__Bottom">
        {translation?.id &&
          (translation?.content ||
            translation?.proofreadContent ||
            translation?.selected) && (
            <div className="Translation__Buttons">
              {can(currentProject, PROJECT_PERMISSION.CHECK_TRA) ? (
                <div
                  className="Translation__TranslationCheckbox"
                  onClick={() => {
                    if (!source.selecting) {
                      handleSelectTranslation();
                    }
                  }}
                >
                  <Checkbox
                    checked={translation.selected}
                    disabled={source.selecting}
                  />
                </div>
              ) : (
                translation.selected && (
                  <Tooltip
                    title={formatMessage({ id: 'translation.best' })}
                    placement="left"
                    align={{ offset: [5, 0] }}
                  >
                    <div className="Translation__TranslationCheckbox Translation__TranslationCheckbox--disabled">
                      <Checkbox checked={true} />
                    </div>
                  </Tooltip>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
};
