import { css } from '@emotion/core';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FC } from '@/interfaces';
import classNames from 'classnames';
import {
  Button,
  Input,
  message,
  Modal,
  Space,
  Table,
  TablePaginationConfig,
  Form as AntdForm,
} from 'antd';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import { api } from '@/apis';
import { toLowerCamelCase } from '@/utils';
import { APIUser } from '@/apis/user';
import { FormItem } from '@/components/FormItem';
import { Form } from '@/components/Form';
import { EmailInput } from '@/components/EmailInput';
import { EMAIL_REGEX, USER_NAME_REGEX } from '@/utils/regex';

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
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 30,
    total: 0,
  });
  // 修改用户密码
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [changePasswordModalUser, setChangePasswordModalUser] =
    useState<APIUser | null>(null);
  // 创建用户
  const [form] = AntdForm.useForm();
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.user.adminGetUserList({
        params: {
          page: pagination?.current,
          limit: pagination?.pageSize,
          word,
        },
      });
      const data = toLowerCamelCase(result.data);
      setPagination({
        ...pagination,
        total: result.headers['x-pagination-count'],
      });
      setData(data);
    } catch (error) {
      error.default();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(pagination), word]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const handelChangeAdminStatus = async (record: APIUser) => {
    setLoading(true);
    try {
      await api.user.adminChangeAdminStatus({
        data: {
          userId: record.id,
          status: !record.admin,
        },
      });
      fetchData();
      message.success(formatMessage({ id: 'site.setting.editSuccess' }));
    } catch (error) {
      error.default();
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordModalOk = () => {
    handelChangePassword(changePasswordModalUser!.id, newPassword);
    setChangePasswordModalOpen(false);
    setNewPassword('');
  };

  const handleChangePasswordModalCancel = () => {
    setChangePasswordModalOpen(false);
    setNewPassword('');
  };

  const handleCreateUserFormFinish = (values: any) => {
    api.user
      .adminCreateUser({
        data: values,
      })
      .then(() => {
        message.success(formatMessage({ id: 'site.setting.createSuccess' }));
        fetchData();
        setCreateUserModalOpen(false);
      })
      .catch((error) => {
        error.default(form);
      });
  };

  const handleCreateUserModalCancel = () => {
    setCreateUserModalOpen(false);
  };

  const handelChangePassword = async (userID: string, password: string) => {
    setLoading(true);
    try {
      await api.user.adminEditUserPassword({
        userID: userID,
        data: { password },
      });
      message.success(formatMessage({ id: 'site.setting.editSuccess' }));
    } catch (error) {
      message.error(error.data.message?.password?.[0]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: formatMessage({ id: 'site.userName' }),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: formatMessage({ id: 'site.email' }),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: formatMessage({ id: 'admin.actions' }),
      key: 'action',
      render: (_: any, record: APIUser) => (
        <Space size="middle">
          <a
            onClick={() => {
              handelChangeAdminStatus(record);
            }}
          >
            {record.admin
              ? formatMessage({ id: 'admin.setAdmin' })
              : formatMessage({ id: 'admin.unsetAdmin' })}
          </a>
          <a
            onClick={() => {
              setChangePasswordModalUser(record);
              setChangePasswordModalOpen(true);
            }}
          >
            {formatMessage({ id: 'admin.resetPassword' })}
          </a>
        </Space>
      ),
    },
  ];

  return (
    <div className={classNames('AdminUserList', className)} css={css``}>
      <header
        css={css`
          display: flex;
          padding: 8px;
        `}
      >
        <Input
          value={word}
          onChange={(e) => {
            setWord(e.target.value);
          }}
          placeholder={formatMessage({ id: 'admin.searchUser' })}
          css={css`
            margin-right: 8px;
          `}
        />
        <Button
          type="primary"
          onClick={() => {
            setCreateUserModalOpen(true);
          }}
        >
          {formatMessage({ id: 'admin.createUser' })}
        </Button>
      </header>
      <Table
        dataSource={data}
        rowKey={(record) => record.id}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />
      <Modal
        title={formatMessage({ id: 'admin.resetPassword' })}
        visible={changePasswordModalOpen}
        onOk={handleChangePasswordModalOk}
        onCancel={handleChangePasswordModalCancel}
      >
        <Input.Password
          minLength={6}
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
          }}
        />
      </Modal>
      <Modal
        title={formatMessage({ id: 'admin.createUser' })}
        visible={createUserModalOpen}
        onCancel={handleCreateUserModalCancel}
        footer={null}
      >
        <Form
          name="register-form"
          form={form}
          onFinish={handleCreateUserFormFinish}
        >
          <FormItem
            name="email"
            rules={[
              { required: true },
              {
                pattern: EMAIL_REGEX,
                message: formatMessage({ id: 'form.formatWrong' }),
              },
            ]}
          >
            <EmailInput prefix={formatMessage({ id: 'site.email' })} />
          </FormItem>
          <FormItem
            name="name"
            rules={[
              { required: true },
              {
                pattern: USER_NAME_REGEX,
                message: formatMessage({ id: 'auth.userNameFormatTip' }),
              },
              { min: 2 },
              { max: 18 },
            ]}
          >
            <Input prefix={formatMessage({ id: 'site.userName' })} />
          </FormItem>
          <FormItem
            name="password"
            rules={[{ required: true }, { min: 6 }, { max: 60 }]}
          >
            <Input.Password prefix={formatMessage({ id: 'site.password' })} />
          </FormItem>
          <FormItem>
            <Button type="primary" block htmlType="submit">
              {formatMessage({ id: 'form.submit' })}
            </Button>
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
};
