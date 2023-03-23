import { css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FC } from '../interfaces';
import classNames from 'classnames';
import { Space, Table, TablePaginationConfig } from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import apis from '../apis';
import { toLowerCamelCase } from '../utils';
import { APIUser } from '../apis/user';

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

/** 用户列表管理的属性接口 */
interface AdminUserListProps {
  className?: string;
}
/**
 * 用户列表管理
 */
export const AdminUserList: FC<AdminUserListProps> = ({ className }) => {
  const { formatMessage } = useIntl();

  const [data, setData] = useState<APIUser[]>([]);
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await apis.adminGetUserList({
        params: {
          page: tableParams.pagination?.current,
          limit: tableParams.pagination?.pageSize,
          word,
        },
      });
      const data = toLowerCamelCase(result.data);
      setData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams)]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setTableParams({
      pagination,
    });
  };

  const handelChangeAdminStatus = async (record: APIUser) => {
    setLoading(true);
    try {
      await apis.adminChangeAdminStatus({
        data: {
          userId: record.id,
          status: !record.admin,
        },
      });
      fetchData();
    } catch (error) {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: APIUser) => (
        <Space size="middle">
          <a
            onClick={() => {
              handelChangeAdminStatus(record);
            }}
          >
            {record.admin ? '取消管理员' : '设置管理员'}
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div className={classNames('AdminUserList', className)} css={css``}>
      <Table
        dataSource={data}
        rowKey={(record) => record.id}
        columns={columns}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />
    </div>
  );
};
