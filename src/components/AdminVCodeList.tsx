import { css } from '@emotion/core';
import { Table, TablePaginationConfig } from 'antd';
import type { FilterValue } from 'antd/es/table/interface';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import apis from '../apis';
import { APIVCode } from '../apis/user';
import { FC } from '../interfaces';
import { toLowerCamelCase } from '../utils';
import dayjs from 'dayjs';

/** 验证码列表的属性接口 */
interface AdminVCodeListProps {
  className?: string;
}
/**
 * 验证码列表
 */
export const AdminVCodeList: FC<AdminVCodeListProps> = ({ className }) => {
  const [data, setData] = useState<APIVCode[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apis.adminGetVCodeList();
      const data = toLowerCamelCase(result.data);
      setData(data);
    } catch (error) {
      error.default();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: '类型介绍',
      dataIndex: 'intro',
      key: 'intro',
    },
    {
      title: '验证码',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: '验证码信息',
      dataIndex: 'info',
      key: 'info',
    },
    {
      title: '过期时间',
      dataIndex: 'expires',
      key: 'expires',
      render: (_: any, record: APIVCode) =>
        (dayjs.utc().isAfter(dayjs.utc(record.expires)) ? '[已过期] ' : '') +
        dayjs.utc(record.expires).local().format('lll'),
    },
    {
      title: '生成时间',
      dataIndex: 'sendTime',
      key: 'sendTime',
    },
  ];

  return (
    <div className={classNames('AdminVCodeList', className)} css={css``}>
      <Table
        dataSource={data}
        rowKey={(record) => record.id}
        columns={columns}
        loading={loading}
      />
    </div>
  );
};
