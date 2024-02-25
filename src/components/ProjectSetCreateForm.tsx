import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Form, FormItem } from '.';
import api from '../apis';
import { FC, ProjectSet } from '../interfaces';
import { resetProjectsState } from '../store/project/slice';
import {
  createProjectSet,
  resetProjectSetsState,
} from '../store/projectSet/slice';
import { toLowerCamelCase } from '../utils';

/** 创建团队表单的属性接口 */
interface ProjectSetCreateFormProps {
  teamID: string;
  className?: string;
}
/**
 * 创建团队表单
 */
export const ProjectSetCreateForm: FC<ProjectSetCreateFormProps> = ({
  teamID,
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const [form] = AntdForm.useForm();
  const dispatch = useDispatch();
  const history = useHistory();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = (values: any) => {
    setSubmitting(true);
    api
      .createProjectSet({ teamID, data: values })
      .then((result) => {
        setSubmitting(false);
        dispatch(resetProjectSetsState());
        dispatch(resetProjectsState());
        // 创建成功
        dispatch(
          createProjectSet({
            projectSet: toLowerCamelCase<ProjectSet>(result.data.project_set),
            unshift: true,
          }),
        );
        // 跳转到项目集
        history.replace(
          `/dashboard/teams/${teamID}/project-sets/${result.data.project_set.id}`,
        );
        // 弹出提示
        message.success(result.data.message);
      })
      .catch((error) => {
        error.default(form);
        setSubmitting(false);
      });
  };

  return (
    <div
      className={className}
      css={css`
        width: 100%;
        .ant-form-item:last-child {
          margin-bottom: 0;
        }
      `}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        initialValues={{ intro: '' }}
        hideRequiredMark
      >
        <FormItem
          name="name"
          label={formatMessage({ id: 'projectSet.name' })}
          rules={[{ required: true }, { min: 1 }, { max: 40 }]}
        >
          <Input />
        </FormItem>
        <FormItem>
          <Button type="primary" block htmlType="submit" loading={submitting}>
            {formatMessage({ id: 'form.submit' })}
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};
