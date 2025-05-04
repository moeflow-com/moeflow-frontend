import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { PROJECT_PERMISSION } from '@/constants';
import { FC } from '@/interfaces';
import { AppState } from '@/store';
import { setImageTranslatorMode } from '@/store/imageTranslator/slice';
import style from '@/style';
import { clearClickEffect, clickEffect } from '@/utils/style';
import { can } from '@/utils/user';

/** 模板的属性接口 */
interface ImageSourceViewerModeControlProps {
  className?: string;
}
/**
 * 模板
 */
export const ImageSourceViewerModeControl: FC<
  ImageSourceViewerModeControlProps
> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n
  const dispatch = useDispatch();
  const mode = useSelector((state: AppState) => state.imageTranslator.mode);
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );

  return (
    <div
      className={classNames(['ImageSourceViewerModeControl', className])}
      css={css`
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        border-bottom: 1px solid ${style.borderColorBase};

        .ImageSourceViewerModeControl__Button {
          text-align: center;
          background: #eee;
          width: 50%;
          border: none; // remove UA style
          border-right: 1px solid ${style.borderColorBase};
          padding: 4px 0;

          :last-child {
            border-right: 0;
          }

          ${clickEffect(
            `background-color: #f7f7f7;`,
            `background-color: #fff`,
          )};
        }

        .ImageSourceViewerModeControl__Button--active {
          background: #fff;
          ${clearClickEffect()};
        }
      `}
    >
      <button
        type="button"
        style={{ display: 'none' }}
        className={classNames('ImageSourceViewerModeControl__Button', {
          'ImageSourceViewerModeControl__Button--active': mode === 'source',
        })}
        onClick={() => {
          dispatch(setImageTranslatorMode('source'));
        }}
      >
        {formatMessage({ id: 'imageTranslator.markerMode' })}
      </button>
      <button
        type="button"
        className={classNames('ImageSourceViewerModeControl__Button', {
          'ImageSourceViewerModeControl__Button--active': mode === 'translator',
        })}
        onClick={() => {
          dispatch(setImageTranslatorMode('translator'));
        }}
      >
        {formatMessage({ id: 'imageTranslator.translatorMode' })}
      </button>
      {can(currentProject, PROJECT_PERMISSION.PROOFREAD_TRA) && (
        <button
          type="button"
          className={classNames('ImageSourceViewerModeControl__Button', {
            'ImageSourceViewerModeControl__Button--active':
              mode === 'proofreader',
          })}
          onClick={() => {
            dispatch(setImageTranslatorMode('proofreader'));
          }}
        >
          {formatMessage({ id: 'imageTranslator.proofreaderMode' })}
        </button>
      )}
      <button
        type="button"
        className={classNames('ImageSourceViewerModeControl__Button', {
          'ImageSourceViewerModeControl__Button--active': mode === 'god',
        })}
        onClick={() => {
          dispatch(setImageTranslatorMode('god'));
        }}
      >
        {formatMessage({ id: 'imageTranslator.godMode' })}
      </button>
    </div>
  );
};
