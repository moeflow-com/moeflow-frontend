import { css } from '@emotion/core';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { FC, labelSavingStatuses, Source } from '../interfaces';
import classNames from 'classnames';
import { Button } from 'antd';
import {
  editMyTranslationSaga,
  EditMyTranslationSagaAction,
  editProofreadSaga,
  EditProofreadSagaAction,
  SavingStatus,
  setSavingStatus,
} from '../store/source/slice';
import { useDispatch } from 'react-redux';
import style from '../style';

/** 翻译/校对保存出错提示的属性接口 */
interface TranslationSaveFailedProps {
  sources: Source[];
  targetID: string;
  className?: string;
}
/**
 * 翻译/校对保存出错提示
 */
export const TranslationSaveFailed: FC<TranslationSaveFailedProps> = ({
  sources,
  targetID,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();

  let savingStatus: SavingStatus = 'saveSuccessful';

  // 检查是否有 label 状态保存中
  const labelSaving = sources.some((source) =>
    labelSavingStatuses.includes(source.labelStatus),
  );
  if (labelSaving) {
    savingStatus = 'saving';
  }

  // 检查是否有保存失败的我的翻译
  // 检查是否有保存失败的校对
  const saveFailedMyTranslations: EditMyTranslationSagaAction[] = [];
  const saveFailedProodreadContents: EditProofreadSagaAction[] = [];
  for (const source of sources) {
    if (
      (source.myTranslationContentStatus === 'saving' ||
        source.myTranslationContentStatus === 'debouncing') &&
      savingStatus === 'saveSuccessful'
    ) {
      savingStatus = 'saving';
    }
    if (
      source.myTranslationContentStatus === 'saveFailed' &&
      source.myTranslation
    ) {
      saveFailedMyTranslations.push({
        sourceID: source.id,
        targetID,
        content: source.myTranslation.content,
        noDebounce: true,
      });
      savingStatus = 'saveFailed';
    }
    for (const translationID in source.proodreadContentStatuses) {
      const proodreadContentStatuses =
        source.proodreadContentStatuses[translationID];
      if (
        (proodreadContentStatuses === 'saving' ||
          proodreadContentStatuses === 'debouncing') &&
        savingStatus === 'saveSuccessful'
      ) {
        savingStatus = 'saving';
      }
      if (proodreadContentStatuses === 'saveFailed') {
        const translations = [...source.translations];
        if (source.myTranslation) {
          translations.push(source.myTranslation);
        }
        const translation = translations.find(
          (translation) => translation.id === translationID,
        );
        saveFailedProodreadContents.push({
          sourceID: source.id,
          translationID,
          proofreadContent: translation!.proofreadContent,
          noDebounce: true,
        });
        savingStatus = 'saveFailed';
      }
    }
  }

  useEffect(() => {
    dispatch(setSavingStatus(savingStatus));
    let unloadMessage = '';
    if (savingStatus === 'saving') {
      unloadMessage = formatMessage({ id: 'imageTranslator.unloadWithSaving' });
    } else if (savingStatus === 'saveFailed') {
      unloadMessage = formatMessage({
        id: 'imageTranslator.unloadWithSaveFailed',
      });
    }
    if (savingStatus === 'saving' || savingStatus === 'saveFailed') {
      window.onbeforeunload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        return unloadMessage;
      };
    } else {
      window.onbeforeunload = () => {};
    }
  });

  // 重试所有保存失败的
  const handleRetryButtonClick = () => {
    for (const myTranslation of saveFailedMyTranslations) {
      dispatch(editMyTranslationSaga(myTranslation));
    }
    for (const proodreadContent of saveFailedProodreadContents) {
      dispatch(editProofreadSaga(proodreadContent));
    }
  };

  if (
    saveFailedMyTranslations.length > 0 ||
    saveFailedProodreadContents.length > 0
  ) {
    return (
      <div
        className={classNames(['TranslationSaveFailed', className])}
        css={css`
          display: flex;
          justify-content: center;
          align-items: center;
          height: 48px;
          background-color: ${style.warningColorLighter};
          .TranslationSaveFailed__RetryTip {
            margin-right: 5px;
          }
        `}
      >
        <div className="TranslationSaveFailed__RetryTip">
          {formatMessage({ id: 'imageTranslator.someSaveFailed' })}
        </div>
        <Button
          className="TranslationSaveFailed__RetryButton"
          size="small"
          onClick={handleRetryButtonClick}
        >
          {formatMessage({ id: 'imageTranslator.retry' })}
        </Button>
      </div>
    );
  } else {
    return null;
  }
};
