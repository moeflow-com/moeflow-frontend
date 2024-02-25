import { css } from '@emotion/core';
import { Input } from 'antd';
import { SearchProps } from 'antd/lib/input/Search';
import classNames from 'classnames';
import React, { useState } from 'react';
import { FC } from '../interfaces';
import style from '../style';
import { clickEffect } from '../utils/style';

/** 列表搜索框的属性接口 */
export interface ListSearchInputProps extends SearchProps {
  rightButton?: React.ReactNode | React.ReactElement;
  onRightButtonClick?: (e: React.MouseEvent) => void;
  className?: string;
}
/**
 * 列表搜索框
 */
export const ListSearchInput: FC<ListSearchInputProps> = ({
  value,
  onChange,
  rightButton,
  onRightButtonClick,
  className,
  ...inputProps
}) => {
  const [word, setWord] = useState(''); // 搜索词

  /** 处理搜索 */
  const handleSearch = (
    value: string,
    e?:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.KeyboardEvent<HTMLInputElement>
      | undefined,
  ) => {
    setWord(value);
    if (inputProps.onSearch) {
      inputProps.onSearch(value, e);
    }
  };

  return (
    <div
      className={className}
      css={css`
        flex: none;
        width: 100%;
        padding: 0 ${style.paddingBase}px;
        height: 45px;
        display: flex;
        justify-content: center;
        align-items: center;
        .ListSearchInput {
          padding: 0;
          background-color: ${style.backgroundColorLight};
          border-radius: ${style.borderRadiusBase};
          .ant-input-affix-wrapper.ant-input-affix-wrapper-sm {
            height: 24px;
          }
          .ant-input-search-button {
            box-shadow: none;
            background-color: ${style.backgroundColorLight};
            border-color: ${style.backgroundColorLight};
            color: ${style.textColorSecondary};
          }
        }
        .ListSearchInput--hasWord {
          .ant-input-search-button {
            color: ${style.primaryColor};
          }
        }
        .right-button {
          width: 45px;
          height: 45px;
          flex: none;
          display: flex;
          justify-content: center;
          align-items: center;
          color: ${style.textColorSecondary};
          ${onRightButtonClick && clickEffect()};
        }
        ${rightButton &&
        css`
          padding-right: 0;
        `};
      `}
    >
      <Input.Search
        className={classNames([
          'ListSearchInput',
          { 'ListSearchInput--hasWord': word },
        ])}
        size="small"
        allowClear
        {...inputProps}
        value={value}
        onChange={onChange}
        onSearch={handleSearch}
        enterButton={true}
        bordered={false}
      />
      {rightButton && (
        <div className="right-button" onClick={onRightButtonClick}>
          {rightButton}
        </div>
      )}
    </div>
  );
};
