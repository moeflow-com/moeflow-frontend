import { css } from '@emotion/core';
import { Radio, Skeleton } from 'antd';
import { RadioChangeEvent, RadioGroupProps } from 'antd/lib/radio';
import React, { useEffect, useState } from 'react';
import api from '../apis';
import { GroupTypes, TypeNames } from '../apis/type';
import configs from '../configs';
import { FC } from '../interfaces';
import { getCancelToken } from '../utils/api';
import { CancelToken } from 'axios';
import { useRouteMatch } from 'react-router-dom';

/** 接口返回的类型格式 */
export interface TypeData {
  id: string;
  system_code: string;
  name: string;
}
/** 用于 /types 接口类型选择单选组的属性接口 */
export interface TypeRadioGroupProps extends Omit<RadioGroupProps, 'onChange'> {
  typeName: TypeNames;
  groupType: GroupTypes;
  onChange?: (value: string) => void;
  onTypeChange?: (value: any) => void;
  /* 自动从 Config 中获取并设置默认值 */
  useDefaultType?: boolean;
  loading?: boolean;
  className?: string;
}
/**
 * 用于 /types 接口类型选择单选组
 */
export const TypeRadioGroup: FC<TypeRadioGroupProps> = ({
  typeName,
  groupType,
  value,
  onChange,
  onTypeChange,
  useDefaultType = false,
  loading = false,
  className,
  children,
  ...radioGroupProps
}) => {
  const [types, setTypes] = useState<TypeData[]>();
  const { url } = useRouteMatch();

  /** 挂载时获取用户类型 */
  useEffect(() => {
    const [cancelToken, cancel] = getCancelToken();
    getTypes({ cancelToken }).then((types) => {
      // 设置默认选项
      if (useDefaultType && types) {
        const defaultType = types.find((x) => {
          if (typeName === 'systemRole') {
            return x.system_code === getDefaultID()
          } else {
            return x.id === getDefaultID()
          }
        });
        if (defaultType) changeType(defaultType);
      }
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  /** 处理改变 */
  const handelChange = (e: RadioChangeEvent) => {
    const type = (types as TypeData[]).find(
      (x) => x.id === e.target.value
    ) as TypeData;
    changeType(type);
  };

  /** 获得默认 ID */
  const getDefaultID = () => {
    return configs.default[groupType][typeName];
  };

  /** 改变选项 */
  const changeType = (type: TypeData) => {
    // 获取默认类型
    if (onChange) onChange(type.id);
    if (onTypeChange) onTypeChange(type);
  };

  /** 获取系统类型 */
  const getTypes = ({ cancelToken }: { cancelToken?: CancelToken } = {}) => {
    return api
      .getTypes({
        typeName,
        groupType,
        configs: {
          cancelToken,
        },
      })
      .then((result) => {
        setTypes(result.data);
        return result.data as TypeData[];
      })
      .catch((error) => {
        error.default();
      });
  };

  return (
    <Radio.Group
      className={className}
      css={css`
        width: 100%;
        white-space: pre-wrap;
      `}
      onChange={handelChange}
      value={value}
      buttonStyle="solid"
      {...radioGroupProps}
    >
      {types && !loading ? (
        types.map((type) => {
          return (
            <Radio.Button value={type.id} key={type.id}>
              {type.name}
            </Radio.Button>
          );
        })
      ) : (
        <Skeleton.Input active />
      )}
      {children}
    </Radio.Group>
  );
};
