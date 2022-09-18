import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Form, FormItem, RoleRadioGroup, TypeRadioGroup } from '.';
import api from '../apis';
import { GROUP_ALLOW_APPLY_TYPE, TEAM_PERMISSION } from '../constants';
import { FC, UserTeam } from '../interfaces';
import { AppState } from '../store';
import { editTeam, setCurrentTeam } from '../store/team/slice';
import { toLowerCamelCase } from '../utils';
import { TEAM_NAME_REGEX } from '../utils/regex';
import { can } from '../utils/user';

/** 修改团队表单的属性接口 */
interface TeamEditFormProps {
  className?: string;
}
/**
 * 修改团队表单
 * 从 redux 的 currentTeam 中读取值，使用前必须先
 * dispatch(setCurrentTeam({ id }));
 */
export const TeamEditForm: FC<TeamEditFormProps> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n
  const [form] = AntdForm.useForm();
  const dispatch = useDispatch();
  const currentTeam = useSelector(
    (state: AppState) => state.team.currentTeam
  ) as UserTeam;
  const [submitting, setSubmitting] = useState(false);
  const [isAllowApply, setIsAllowApply] = useState(
    currentTeam.allowApplyType !== GROUP_ALLOW_APPLY_TYPE.NONE
  );

  // id 改变时，获取初始值
  useEffect(() => {
    form.setFieldsValue(toLowerCamelCase(currentTeam));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTeam.id]);

  const handleFinish = (values: any) => {
    setSubmitting(true);
    api
      .editTeam({ id: currentTeam.id, data: values })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        // 修改成功
        dispatch(editTeam(data.team));
        dispatch(setCurrentTeam(data.team));
        // 弹出提示
        message.success(data.message);
      })
      .catch((error) => {
        error.default(form);
      })
      .finally(() => setSubmitting(false));
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
              values.allowApplyType !== GROUP_ALLOW_APPLY_TYPE.NONE
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
          <Input disabled={!can(currentTeam, TEAM_PERMISSION.CHANGE)} />
        </FormItem>
        <FormItem
          name="intro"
          label={formatMessage({ id: 'team.intro' })}
          rules={[{ min: 0 }, { max: 140 }]}
        >
          <Input.TextArea
            disabled={!can(currentTeam, TEAM_PERMISSION.CHANGE)}
          />
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
            disabled={!can(currentTeam, TEAM_PERMISSION.CHANGE)}
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
            disabled={!can(currentTeam, TEAM_PERMISSION.CHANGE)}
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
          <RoleRadioGroup
            groupType="team"
            disabled={!can(currentTeam, TEAM_PERMISSION.CHANGE)}
          />
        </FormItem>
        {can(currentTeam, TEAM_PERMISSION.CHANGE) && (
          <FormItem>
            <Button type="primary" block htmlType="submit" loading={submitting}>
              {formatMessage({ id: 'site.save' })}
            </Button>
          </FormItem>
        )}
      </Form>
    </div>
  );
};
