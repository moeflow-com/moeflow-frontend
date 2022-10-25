import { css } from '@emotion/core';
import { Select } from 'antd';
import { SelectProps } from 'antd/lib/select';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import apis from '../apis';
import { FC } from '../interfaces';
import { toLowerCamelCase } from '../utils';

interface SelectOption {
  label: string;
  value: string;
  disabled: boolean;
}
/** 语言选择器的属性接口 */
interface LanguageSelectProps extends SelectProps<string | string[]> {
  disabledLanguageIDs?: string[];
  className?: string;
}
/**
 * 语言选择器
 */
export const LanguageSelect: FC<LanguageSelectProps> = ({
  disabledLanguageIDs = [],
  className,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    setLoading(true);
    apis.getLanguages().then((result) => {
      let options = result.data.map((item) => {
        item = toLowerCamelCase(item);
        const option: SelectOption = {
          label: item.i18nName,
          value: item.code,
          disabled: false,
        };
        return option;
      });
      setOptions(options);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function filterDisabledLanguage(options: SelectOption[]) {
      return options.map((option) => ({
        ...option,
        disabled: disabledLanguageIDs.includes(option.value),
      }));
    }
    setOptions((options) => filterDisabledLanguage(options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length, disabledLanguageIDs.length, disabledLanguageIDs[0]]);

  return (
    <Select
      className={classNames(['LanguageSelect', className])}
      css={css``}
      loading={loading}
      options={options}
      optionFilterProp="label"
      showSearch
      showArrow
      {...props}
    ></Select>
  );
};
