import { css } from '@emotion/core';
import { Switch } from 'antd';
import { Canceler } from 'axios';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import apis from '../apis';
import { APIOutput, CreateOutputData } from '../apis/output';
import { OUTPUT_STATUS, OUTPUT_TYPE } from '../constants/output';
import { FC } from '../interfaces';
import style from '../style';
import { toLowerCamelCase } from '../utils';
import { getCancelToken } from '../utils/api';
import { useStateRef } from '../hooks';
import { Button } from './Button';
import { Output } from './Output';

/** 模板的属性接口 */
interface OutputListProps {
  projectID: string;
  targetID: string;
  selectedFileIds?: string[];
  className?: string;
}
/**
 * 模板
 */
export const OutputList: FC<OutputListProps> = ({
  projectID,
  targetID,
  selectedFileIds = [],
  className,
}) => {
  const { formatMessage } = useIntl();
  const [outputs, setOutputs, outputsRef] = useStateRef<APIOutput[]>();
  const [outputing, setOutputing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [isExclude, setIsExclude] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      let shouldRefresh = false;
      if (outputsRef.current && outputsRef.current.length > 0) {
        for (const output of outputsRef.current) {
          if (
            ![OUTPUT_STATUS.ERROR, OUTPUT_STATUS.SUCCEEDED].includes(
              output.status
            )
          ) {
            shouldRefresh = true;
            break;
          }
        }
      }
      if (shouldRefresh) {
        fetchOutputs();
      }
    }, 5000);
    return () => {
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID, targetID]);

  useEffect(() => {
    fetchOutputs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectID, targetID]);

  const fetchOutputsCancelRef = useRef<Canceler>();
  const fetchOutputs = () => {
    setFetching(true);
    fetchOutputsCancelRef.current?.();
    const [cancelToken, cancel] = getCancelToken();
    fetchOutputsCancelRef.current = cancel;
    apis
      .getOutputs({
        projectID,
        targetID,
        configs: {
          cancelToken,
        },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        setOutputs(data);
      })
      .catch((error) => {
        error.default();
      })
      .finally(() => {
        setFetching(false);
      });
  };

  const createOutputs = ({ type }: { type: OUTPUT_TYPE }) => {
    setOutputing(true);
    const data: CreateOutputData = {
      type,
    };
    if (selectedFileIds.length > 0) {
      if (isExclude) {
        data.fileIdsExclude = selectedFileIds;
      } else {
        data.fileIdsInclude = selectedFileIds;
      }
    }
    apis
      .createOutput({
        projectID,
        targetID,
        data,
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        setOutputs((outputs) =>
          outputs ? [data, ...outputs].slice(0, 3) : [data]
        );
      })
      .catch((error) => {
        error.default();
      })
      .finally(() => {
        setOutputing(false);
      });
  };

  return (
    // TODO: 将这里 loading 改成好看的占位符
    <div
      className={classNames(['OutputList', className])}
      css={css`
        .OutputList__Title {
          padding: 10px 24px 4px;
        }
        .OutputList__ExcludeSwitchWrapper {
          float: right;
          color: ${style.primaryColor};
          font-weight: bold;
          display: flex;
          align-items: center;
        }
        .OutputList__ExcludeSwitch {
          margin-left: 6px;
        }
        .OutputList__Buttons {
          display: flex;
          justify-content: stretch;
          .Button {
            width: 50%;
          }
        }
        .OutputList__Outputs {
          padding: 16px 24px;
        }
        .OutputList__Resource {
          border-top: 1px solid ${style.borderColorLight};
        }
        .OutputList__ResourceTitle {
          padding: 10px 24px 4px;
        }
        .OutputList__Tip {
          width: 100%;
          padding-top: 16px;
          text-align: center;
          color: ${style.primaryColorLighter};
          border-top: 1px solid ${style.borderColorLight};
        }
      `}
    >
      <div className="OutputList__Title">
        {selectedFileIds.length > 0
          ? isExclude
            ? formatMessage(
                { id: 'output.outputPartialExclude' },
                { count: selectedFileIds.length }
              )
            : formatMessage(
                { id: 'output.outputPartial' },
                { count: selectedFileIds.length }
              )
          : formatMessage({ id: 'output.outputAll' })}
        {formatMessage({ id: ':' })}
        {selectedFileIds.length > 0 && (
          <div className="OutputList__ExcludeSwitchWrapper">
            {formatMessage({ id: 'output.invert' })}
            <Switch
              className="OutputList__ExcludeSwitch"
              onChange={(value) => {
                setIsExclude(value);
              }}
              size="small"
            />
          </div>
        )}
      </div>
      <div className="OutputList__Buttons">
        <Button
          className="OutputList__Button"
          icon="download"
          onClick={() => {
            createOutputs({ type: OUTPUT_TYPE.ALL });
          }}
          loading={outputing}
        >
          {formatMessage({ id: 'output.createButton' })}
        </Button>
        <Button
          className="OutputList__Button"
          icon="download"
          onClick={() => {
            createOutputs({ type: OUTPUT_TYPE.ONLY_TEXT });
          }}
          loading={outputing}
        >
          {formatMessage({ id: 'output.createOnlyTextButton' })}
        </Button>
      </div>
      <div className="OutputList__Resource">
        <div className="OutputList__ResourceTitle">
          {formatMessage({ id: 'output.otherResource' })}
          {formatMessage({ id: ':' })}
        </div>
        <Button
          className="OutputList__ResourceButton"
          icon="link"
          type="link"
          linkProps={{
            href: 'https://files.kozzzx.com/labelplus/LabelPlus_PS-Script_latest.zip',
            target: '_blank',
            rel: 'noopener noreferrer',
          }}
        >
          下载 PS 脚本
        </Button>
      </div>
      <div className="OutputList__Tip">
        {fetching
          ? formatMessage({ id: 'site.loading' }) + '...'
          : formatMessage({ id: 'output.tip' })}
      </div>
      <div className="OutputList__Outputs">
        {outputs === undefined
          ? undefined
          : outputs.length === 0
          ? formatMessage({ id: 'output.empty' })
          : outputs.map((output, i) => (
              <Output
                className="OutputList__Output"
                output={output}
                index={i}
                key={output.id}
              />
            ))}
      </div>
    </div>
  );
};
