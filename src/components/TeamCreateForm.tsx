import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message } from 'antd';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Form, FormItem, RoleRadioGroup, TypeRadioGroup } from '.';
import api from '../apis';
import { GROUP_ALLOW_APPLY_TYPE } from '../constants';
import { FC, UserTeam } from '../interfaces';
import { resetProjectSetsState } from '../store/projectSet/slice';
import { createTeam } from '../store/team/slice';
import { toLowerCamelCase } from '../utils';
import { TEAM_NAME_REGEX } from '../utils/regex';

/** 创建团队表单的属性接口 */
interface TeamCreateFormProps {
  className?: string;
}
/**
 * 创建团队表单
 */
export const TeamCreateForm: FC<TeamCreateFormProps> = ({ className }) => {
  const { formatMessage } = useIntl();
  const [form] = AntdForm.useForm();
  const dispatch = useDispatch();
  const history = useHistory();
  const [isAllowApply, setIsAllowApply] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = (values: any) => {
    setSubmitting(true);
    api
      .createTeam({ data: values })
      .then((result) => {
        setSubmitting(false);
        // 创建成功
        dispatch(
          createTeam({
            team: toLowerCamelCase<UserTeam>(result.data.team),
            unshift: true,
          }),
        );
        dispatch(resetProjectSetsState());
        // 跳转到团队
        history.replace(`/dashboard/teams/${result.data.team.id}`);
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
        onValuesChange={(values) => {
          // 关闭加入时，隐藏加入选项
          if (values.allowApplyType) {
            setIsAllowApply(
              values.allowApplyType !== GROUP_ALLOW_APPLY_TYPE.NONE,
            );
          }
        }}
      >
        <FormItem
          name="name"
          label={formatMessage({ id: 'team.name' })}
          rules={[
            {
              pattern: TEAM_NAME_REGEX,
              message: formatMessage({ id: 'auth.userNameFormatTip' }),
            },
            { required: true },
            { min: 2 },
            { max: 18 },
          ]}
        >
          <Input />
        </FormItem>
        <FormItem
          name="intro"
          label={formatMessage({ id: 'team.intro' })}
          rules={[{ min: 0 }, { max: 140 }]}
        >
          <Input.TextArea />
        </FormItem>
        <FormItem
          name="allowApplyType"
          label={formatMessage({ id: 'site.allowApplyTypeLabel' })}
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'form.selectRequired' }),
            },
          ]}
        >
          <TypeRadioGroup
            typeName="allowApplyType"
            groupType="team"
            useDefaultType={true}
          />
        </FormItem>
        <FormItem
          style={{
            display: isAllowApply ? 'flex' : 'none',
          }}
          name="applicationCheckType"
          label={formatMessage({ id: 'site.applicationCheckTypeLabel' })}
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'form.selectRequired' }),
            },
          ]}
        >
          <TypeRadioGroup
            typeName="applicationCheckType"
            groupType="team"
            useDefaultType={true}
          />
        </FormItem>
        <FormItem
          style={{
            display: isAllowApply ? 'flex' : 'none',
          }}
          name="defaultRole"
          label={formatMessage({ id: 'site.defaultRoleLabel' })}
          rules={[
            {
              required: true,
              message: formatMessage({ id: 'form.selectRequired' }),
            },
          ]}
        >
          <RoleRadioGroup groupType="team" useDefaultType={true} />
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
