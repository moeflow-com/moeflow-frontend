import { css } from '@emotion/core';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';
import { useIntl } from 'react-intl';
import { Avatar } from '.';
import { APIOutput } from '../apis/output';
import { OUTPUT_STATUS, OUTPUT_TYPE } from '../constants/output';
import { FC } from '../interfaces';
import style from '../style';
import { Button } from './Button';

/** 导出的属性接口 */
interface OutputProps {
  index: number;
  output: APIOutput;
  className?: string;
}
/**
 * 导出
 */
export const Output: FC<OutputProps> = ({ index, output, className }) => {
  const { formatMessage } = useIntl(); // i18n

  return (
    <div
      className={classNames(['Output', className])}
      css={css`
        border: 1px solid ${style.borderColorLight};
        margin-bottom: 10px;
        .Output__Top {
          display: flex;
          justify-content: stretch;
          align-items: center;
          margin: 10px 16px 0;
          padding-bottom: 10px;
          border-bottom: 1px solid ${style.borderColorLight};
        }
        .Output__UserAvatar {
          margin-right: 10px;
        }
        .Output__UserName {
        }
        .Output__CreateTime {
          color: ${style.textColorSecondary};
        }
      `}
    >
      <div className="Output__Top">
        {output.user && (
          <Avatar
            className="Output__UserAvatar"
            url={output.user.avatar}
            type="user"
          />
        )}
        <div>
          {output.user && (
            <div className="Output__UserName">{output.user.name} </div>
          )}
          <div>
            {formatMessage(
              {
                id:
                  output.fileIDsExclude.length > 0 ||
                  output.fileIDsInclude.length > 0
                    ? 'output.partAt'
                    : 'output.at',
              },
              {
                outputType:
                  output.type === OUTPUT_TYPE.ONLY_TEXT
                    ? formatMessage({ id: '(' }) +
                      formatMessage({ id: 'output.onlyText' }) +
                      formatMessage({ id: ')' })
                    : '',
              },
            )}
          </div>
          <div className="Output__CreateTime">
            {dayjs.utc(output.createTime).local().format('lll')}
          </div>
        </div>
      </div>
      <div className="Output__CreateTime"></div>
      <div className="Output__Bottom">
        <Button
          className="Output__DownloadButton"
          disabled={output.status === OUTPUT_STATUS.ERROR}
          loading={
            ![OUTPUT_STATUS.SUCCEEDED, OUTPUT_STATUS.ERROR].includes(
              output.status,
            )
          }
          color={style.textColor}
          colorDisibled={style.textColorSecondary}
          type="link"
          linkProps={{ href: output.link, target: '_blank' }}
        >
          {output.link
            ? formatMessage({ id: 'output.download' })
            : output.statusDetails.find((d) => d.id === output.status)?.name}
        </Button>
      </div>
    </div>
  );
};
