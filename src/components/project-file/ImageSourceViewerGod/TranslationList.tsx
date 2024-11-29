import { css } from '@emotion/core';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Translation } from './Translation';
import { PROJECT_PERMISSION } from '@/constants';
import { FC, Source } from '@/interfaces';
import { Translation as ITranslation } from '@/interfaces/translation';
import { AppState } from '@/store';
import style from '@/style';
import { filterValidTranslations, isValidTranslation } from '@/utils/source';
import { can } from '@/utils/user';

/** 翻译列表的属性接口 */
interface TranslationListProps {
  myTranslation?: ITranslation;
  otherTranslations: ITranslation[];
  source: Source;
  targetID: string;
  className?: string;
}
/**
 * 翻译列表
 */
export const TranslationList: FC<TranslationListProps> = ({
  myTranslation,
  otherTranslations,
  source,
  targetID,
  className,
}) => {
  const proofreadEditable = true;
  const textAreasRef = useRef<TextAreaRef>(null);
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  );
  const focusedSourceID = useSelector(
    (state: AppState) => state.source.focusedSource.id,
  );
  const focusedSourceEffects = useSelector(
    (state: AppState) => state.source.focusedSource.effects,
  );
  const focusedSourceNoiseFocusInput = useSelector(
    (state: AppState) => state.source.focusedSource.noises.focusInput,
  );
  const otherValidTranslations = filterValidTranslations(otherTranslations);

  useEffect(() => {
    if (
      focusedSourceID === source.id &&
      focusedSourceEffects.includes('focusInput')
    ) {
      setTimeout(() => {
        textAreasRef.current?.focus({ cursor: 'end' });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedSourceID, focusedSourceNoiseFocusInput]);

  return (
    <div
      className={classNames('TranslationList', className)}
      css={css`
        flex: auto;
        .TranslationList__MyTranslation {
          padding: 0 5px 5px;
          border-bottom: 1px solid ${style.borderColorBase};
        }
        .TranslationList__OtherTranslation {
          padding: 0 5px 5px;
          border-bottom: 1px solid ${style.borderColorBase};
        }
      `}
    >
      {(can(currentProject, PROJECT_PERMISSION.ADD_TRA) ||
        isValidTranslation(myTranslation)) && (
        <div className="TranslationList__MyTranslation">
          <Translation
            source={source}
            targetID={targetID}
            translation={myTranslation}
            mine={true}
            textAreaProps={{
              disabled: ['creating', 'deleting'].includes(source?.labelStatus),
            }}
            proofreadEditable={proofreadEditable}
            textAreaRef={textAreasRef}
          />
        </div>
      )}
      {otherValidTranslations.length > 0 && (
        <div className="TranslationList__OtherTranslations">
          {otherValidTranslations.map((otherTranslation) => {
            return (
              <Translation
                className="TranslationList__OtherTranslation"
                source={source}
                targetID={targetID}
                translation={otherTranslation}
                mine={false}
                myTranslation={myTranslation}
                proofreadEditable={proofreadEditable}
                key={otherTranslation.id}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
