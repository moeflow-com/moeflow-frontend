import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { GroupTypes } from '../apis/type';
import { FC } from '../interfaces';
import { ID_REGEX } from '../utils/regex';
import { Form } from './Form';
import { FormItem } from './FormItem';

/** 加入团体表单的属性接口 */
interface GroupJoinFormProps {
  groupType: GroupTypes;
  className?: string;
}
/**
 * 加入团体表单
 */
export const GroupJoinForm: FC<GroupJoinFormProps> = ({
  groupType,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const [form] = AntdForm.useForm();
  const history = useHistory();

  const handleFinish = (values: any) => {
    history.push(`/dashboard/join/${groupType}/${values.groupID}`);
  };

  return (
    <div className={classNames(['GroupJoinForm', className])} css={css``}>
      <Form
        form={form}
        onFinish={handleFinish}
        initialValues={{ groupID: '' }}
        hideRequiredMark
      >
        <FormItem
          name="groupID"
          label={formatMessage({ id: groupType + '.id' })}
          rules={[
            { required: true },
            {
              pattern: ID_REGEX,
              message: formatMessage({ id: 'form.idTip' }),
            },
          ]}
        >
          <Input maxLength={24} />
        </FormItem>
        <FormItem>
          <Button type="primary" block htmlType="submit">
            {formatMessage({ id: 'form.submit' })}
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};
