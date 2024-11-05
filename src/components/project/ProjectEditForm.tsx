import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Form, FormItem, RoleRadioGroup, TypeRadioGroup } from '..';
import api from '../../apis';
import { GROUP_ALLOW_APPLY_TYPE, PROJECT_PERMISSION } from '@/constants';
import { FC, Project } from '@/interfaces';
import { AppState } from '@/store';
import { editProject, setCurrentProject } from '@/store/project/slice';
import { toLowerCamelCase } from '@/utils';
import { can } from '@/utils/user';

/** 修改项目表单的属性接口 */
interface ProjectEditFormProps {
  className?: string;
}
/**
 * 修改项目表单
 * 从 redux 的 currentProject 中读取值，使用前必须先
 * dispatch(setCurrentProject({ id }));
 */
export const ProjectEditForm: FC<ProjectEditFormProps> = ({ className }) => {
  const { formatMessage } = useIntl(); // i18n
  const [form] = AntdForm.useForm();
  const dispatch = useDispatch();
  const currentProject = useSelector(
    (state: AppState) => state.project.currentProject,
  ) as Project;
  const [submitting, setSubmitting] = useState(false);
  const [isAllowApply, setIsAllowApply] = useState(
    currentProject.allowApplyType !== GROUP_ALLOW_APPLY_TYPE.NONE,
  );

  // id 改变时，获取初始值
  useEffect(() => {
    form.setFieldsValue(toLowerCamelCase(currentProject));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id]);

  const handleFinish = (values: any) => {
    setSubmitting(true);
    api
      .editProject({ id: currentProject.id, data: values })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        // 修改成功
        dispatch(editProject(data.project));
        dispatch(setCurrentProject(data.project));
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
              values.allowApplyType !== GROUP_ALLOW_APPLY_TYPE.NONE,
            );
          }
        }}
      >
        <FormItem
          name="name"
          label={formatMessage({ id: 'project.name' })}
          rules={[{ required: true }, { min: 1 }, { max: 40 }]}
        >
          <Input disabled={!can(currentProject, PROJECT_PERMISSION.CHANGE)} />
        </FormItem>
        <FormItem
          name="intro"
          label={formatMessage({ id: 'project.intro' })}
          rules={[{ min: 0 }, { max: 140 }]}
        >
          <Input.TextArea
            disabled={!can(currentProject, PROJECT_PERMISSION.CHANGE)}
          />
        </FormItem>
        <FormItem label={formatMessage({ id: 'project.sourceLanguage' })}>
          <Input
            disabled={true}
            value={currentProject.sourceLanguage.i18nName}
          />
        </FormItem>
        <FormItem label={formatMessage({ id: 'project.targetLanguagesCount' })}>
          <div>
            <span>{currentProject.targetCount} </span>
            <NavLink to={`target`}>
              {formatMessage({ id: 'project.targetLanguages' })}
            </NavLink>
          </div>
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
            groupType="project"
            disabled={!can(currentProject, PROJECT_PERMISSION.CHANGE)}
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
            groupType="project"
            disabled={!can(currentProject, PROJECT_PERMISSION.CHANGE)}
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
            groupType="project"
            disabled={!can(currentProject, PROJECT_PERMISSION.CHANGE)}
          />
        </FormItem>
        {can(currentProject, PROJECT_PERMISSION.CHANGE) && (
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
