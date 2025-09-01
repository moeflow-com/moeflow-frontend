import { css } from '@emotion/core';
import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { Icon, Tooltip } from '@/components';
import { FC } from '@/interfaces';
import style from '@/style';
/** 文件翻译的属性接口 */
interface TranslationProgressProps {
  sourceCount: number;
  translatedSourceCount: number;
  checkedSourceCount: number;
  type?: 'all' | 'text' | 'line';
  className?: string;
}
/**
 * 文件翻译
 */
export const TranslationProgress: FC<TranslationProgressProps> = ({
  sourceCount,
  translatedSourceCount,
  checkedSourceCount,
  type = 'all',
  className,
}) => {
  const { formatMessage } = useIntl();
  let translatedSourcePercent = 0;
  let checkedSourcePercent = 0;
  if (sourceCount > 0) {
    if (translatedSourceCount > 0) {
      translatedSourcePercent = (translatedSourceCount / sourceCount) * 100;
    }
    if (checkedSourceCount > 0) {
      checkedSourcePercent = (checkedSourceCount / sourceCount) * 100;
    }
  }

  return (
    <div
      className={classNames('TranslationProgress', className, {
        'TranslationProgress--noSource': sourceCount <= 0,
      })}
      css={css`
        height: ${type === 'line' ? '10px' : '18px'};
        display: flex;
        align-items: center;
        justify-content: flex-start;
        .TranslationProgress__LineBase {
          position: relative;
          width: 100%;
          height: 10px;
          background: #efefef;
          border-radius: ${style.borderRadiusBase};
          overflow: hidden;
        }
        .TranslationProgress__Line {
          position: absolute;
          left: 0;
          top: 0;
          height: 10px;
          border-radius: ${style.borderRadiusBase};
        }
        .TranslationProgress__ProgressTranslatedSourceCount {
          background: #ffe4a8;
        }
        .TranslationProgress__ProgressCheckedSourceCount {
          background: ${style.primaryColorLightest};
        }
        .TranslationProgress__Text {
          flex: none;
          font-size: 12px;
        }
        .TranslationProgress__TextItem {
          margin-right: 8px;
          color: ${style.textColorLighter};
          .TranslationProgress__TextItemIcon {
            margin-right: 4px;
            color: ${style.textColorSecondaryLighter};
            font-size: 13px;
          }
        }
        .TranslationProgress__TextItem--unfinished {
          border-radius: 4px;
          color: #fff;
          padding: 0 3px 0 2px;
          font-weight: bold;
          &.TranslationProgress__TextItemTranslated {
            background-color: #ffd26e;
          }
          &.TranslationProgress__TextItemChecked {
            background-color: #ffb3bc;
          }
          .TranslationProgress__TextItemIcon {
            margin-right: 2px;
            padding: 1px;
            color: #fff;
          }
        }
        &.TranslationProgress--noSource {
          .TranslationProgress__LineBase {
            background: repeating-linear-gradient(
              45deg,
              #e0e0e0,
              #e0e0e0 15px,
              #efefef 0,
              #efefef 30px
            );
          }
        }
      `}
    >
      {(type === 'all' || type === 'text') && (
        <div className="TranslationProgress__Text">
          {sourceCount > 0 ? (
            <>
              <span className="TranslationProgress__TextItem">
                <Icon
                  icon="tag"
                  className="TranslationProgress__TextItemIcon"
                />
                {sourceCount}
              </span>
              <Tooltip
                overlay={formatMessage({
                  id: 'imageTranslator.translateUnfinished',
                })}
                disabled={translatedSourceCount >= sourceCount}
              >
                <span
                  className={classNames(
                    'TranslationProgress__TextItem',
                    'TranslationProgress__TextItemTranslated',
                    {
                      'TranslationProgress__TextItem--unfinished':
                        translatedSourceCount < sourceCount,
                    },
                  )}
                >
                  <Icon
                    icon="check"
                    className="TranslationProgress__TextItemIcon"
                  />
                  {translatedSourceCount}
                </span>
              </Tooltip>
              <Tooltip
                overlay={formatMessage({
                  id: 'imageTranslator.checkUnfinished',
                })}
                disabled={checkedSourceCount >= sourceCount}
              >
                <span
                  className={classNames(
                    'TranslationProgress__TextItem',
                    'TranslationProgress__TextItemChecked',
                    {
                      'TranslationProgress__TextItem--unfinished':
                        checkedSourceCount < sourceCount,
                    },
                  )}
                >
                  <Icon
                    icon="check-double"
                    className="TranslationProgress__TextItemIcon"
                  />
                  {checkedSourceCount}
                </span>
              </Tooltip>
            </>
          ) : (
            <span className="TranslationProgress__TextItem">
              <Icon icon="tag" className="TranslationProgress__TextItemIcon" />0
            </span>
          )}
        </div>
      )}
      {(type === 'all' || type === 'line') && (
        <div className="TranslationProgress__LineBase">
          <div
            className="TranslationProgress__Line TranslationProgress__ProgressTranslatedSourceCount"
            style={{ width: `${translatedSourcePercent}%` }}
          ></div>
          <div
            className="TranslationProgress__Line TranslationProgress__ProgressCheckedSourceCount"
            style={{ width: `${checkedSourcePercent}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};
