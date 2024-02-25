import { css } from '@emotion/core';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { PROJECT_PERMISSION } from '../constants';
import { FC } from '../interfaces';
import { AppState } from '../store';
import { setImageTranslatorMode } from '../store/imageTranslator/slice';
import style from '../style';
import { clearClickEffect, clickEffect } from '../utils/style';
import { can } from '../utils/user';

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
          display: flex;
          justify-content: center;
          align-items: center;
          background: #eee;
          width: 50%;
          border-right: 1px solid ${style.borderColorBase};
          text-align: center;
          padding: 1px 0;
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
      <div
        className={classNames('ImageSourceViewerModeControl__Button', {
          'ImageSourceViewerModeControl__Button--active': mode === 'translator',
        })}
        onClick={() => {
          dispatch(setImageTranslatorMode('translator'));
        }}
      >
        {formatMessage({ id: 'imageTranslator.translatorMode' })}
      </div>
      {can(currentProject, PROJECT_PERMISSION.PROOFREAD_TRA) && (
        <div
          className={classNames('ImageSourceViewerModeControl__Button', {
            'ImageSourceViewerModeControl__Button--active':
              mode === 'proofreader',
          })}
          onClick={() => {
            dispatch(setImageTranslatorMode('proofreader'));
          }}
        >
          {formatMessage({ id: 'imageTranslator.proofreaderMode' })}
        </div>
      )}
      <div
        className={classNames('ImageSourceViewerModeControl__Button', {
          'ImageSourceViewerModeControl__Button--active': mode === 'god',
        })}
        onClick={() => {
          dispatch(setImageTranslatorMode('god'));
        }}
      >
        {formatMessage({ id: 'imageTranslator.godMode' })}
      </div>
    </div>
  );
};
