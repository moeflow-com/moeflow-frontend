import { css } from '@emotion/core';
import { Switch } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '..';
import { PROJECT_PERMISSION } from '../../constants';
import { SOURCE_POSITION_TYPE } from '../../constants/source';
import { FC } from '../../interfaces';
import { Source as ISource } from '../../interfaces/source';
import { AppState } from '../../store';
import { editSourceSaga, focusSource } from '../../store/source/slice';
import style from '../../style';
import { checkTranslationState } from '../../utils/source';
import { can } from '../../utils/user';
import { TranslationList } from './TranslationList';

/** 原文的属性接口 */
interface SourceProps {
  source: ISource;
  targetID: string;
  index: number;
  className?: string;
}
/**
 * 原文
 */
export const Source: FC<SourceProps> = ({
  source,
  targetID,
  index,
  className,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl(); // i18n
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject
  );

  let statusLine = checkTranslationState(source);

  const handleSourcePositionTypeChange = (checked: boolean) => {
    dispatch(
      editSourceSaga({
        id: source.id,
        positionType: checked
          ? SOURCE_POSITION_TYPE.IN
          : SOURCE_POSITION_TYPE.OUT,
      })
    );
  };

  return (
    <div
      key={source.id}
      className={classNames('Source', className, {
        'Source--focus': source.focus,
      })}
      css={css`
        display: flex;
        &.Source--focus {
          .Source__Info,
          .Source__ContentBottomIconWrapper {
            background: ${style.borderColorLighter};
          }
          .Source__ContentBottomIcon {
            color: ${style.textColorSecondary};
          }
        }
        .Source__StatusLine {
          flex: none;
          width: 5px;
        }
        .Source__StatusLine--needTranslation {
          background: ${style.primaryColorLightest};
        }
        .Source__StatusLine--needCheckTranslation {
          background: ${style.warningColorLightest};
        }
        .Source__StatusLine--needSelectAndCheckTranslation {
          background: ${style.primaryColorLightest};
        }
        .Source__StatusLine--translationOk {
          background: ${style.borderColorLight};
        }
        .Source__Content {
          flex: auto;
          display: flex;
          flex-direction: column;
        }
        .Source__ContentTop {
          display: flex;
        }
        .Source__ContentBottom {
          display: flex;
          align-items: center;
          .ant-radio-wrapper {
            margin-right: 0;
            font-size: 13px;
            color: ${style.textColorSecondary};
            user-select: none;
          }
        }
        .Source__ContentBottomIconWrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 33px;
          height: 32px;
          margin-right: 8px;
          border-right: 1px solid ${style.borderColorLight};
        }
        .Source__ContentBottomIcon {
          color: ${style.textColorSecondaryLightest};
        }
        .Source__PositionSwitch {
          background-color: ${style.warningColorLightest};
          &.ant-switch-checked {
            background-color: ${style.primaryColorLightest};
          }
        }
        .Source__SourcePositionTypeText {
          color: ${style.textColorSecondary};
        }
        .Source__Info {
          flex: none;
          min-width: 18px;
          border-right: 1px solid ${style.borderColorLight};
        }
        .Source__Index {
          text-align: center;
          font-family: 'Label Number', sans-serif;
          border-radius: 50%;
          font-size: 14px;
          height: 32px;
          width: 32px;
          line-height: 32px;
          box-sizing: border-box;
        }
        .Source__MyTranslationStatus {
        }
        .Source__TranslaitonListWrapper {
          flex: auto;
        }
        .Source__DebounceStatus {
          margin-top: 5px;
          text-align: center;
          height: 32px;
          width: 32px;
        }
      `}
      onClick={() => {
        dispatch(
          focusSource({
            id: source.id,
            effects: ['focusLabel'],
            noises: [],
          })
        );
      }}
    >
      <div
        className={classNames(
          'Source__StatusLine',
          `Source__StatusLine--${statusLine}`
        )}
      ></div>
      <div className="Source__Content">
        <div className="Source__ContentTop">
          <div className="Source__Info">
            <div className="Source__Index">{index + 1}</div>
          </div>
          <div className="Source__TranslaitonListWrapper">
            <TranslationList
              myTranslation={source.myTranslation}
              otherTranslations={source.translations}
              source={source}
              targetID={targetID}
              className="Source__TranslationList"
            />
          </div>
        </div>
        <div className="Source__ContentBottom">
          <div className="Source__ContentBottomIconWrapper">
            <Icon className="Source__ContentBottomIcon" icon="tag"></Icon>
          </div>
          {can(currentProject, PROJECT_PERMISSION.MOVE_LABEL) ? (
            <Switch
              className="Source__PositionSwitch"
              size="small"
              checkedChildren={formatMessage({
                id: 'imageTranslator.positionIn',
              })}
              unCheckedChildren={formatMessage({
                id: 'imageTranslator.positionOut',
              })}
              checked={source.positionType === SOURCE_POSITION_TYPE.IN}
              onChange={handleSourcePositionTypeChange}
            />
          ) : (
            <div className="Source__SourcePositionTypeText">
              {SOURCE_POSITION_TYPE.IN
                ? formatMessage({ id: 'imageTranslator.positionIn' })
                : formatMessage({ id: 'imageTranslator.positionOut' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
