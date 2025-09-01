import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Form, FormItem } from '@/components';
import api from '@/apis';
import { FC, UserProjectSet } from '@/interfaces';
import { AppState } from '@/store';
import { editProjectSet, setCurrentProjectSet } from '@/store/projectSet/slice';
import style from '@/style';
import { toLowerCamelCase } from '@/utils';

/** 修改项目集表单的属性接口 */
interface ProjectSetEditFormProps {
  className?: string;
}
/**
 * 修改项目集表单
 * 从 redux 的 currentProjectSet 中读取值，使用前必须先
 * dispatch(setCurrentProjectSet({ id }));
 */
export const ProjectSetEditForm: FC<ProjectSetEditFormProps> = ({
  className,
}) => {
  const { formatMessage } = useIntl(); // i18n
  const [form] = AntdForm.useForm();
  const dispatch = useDispatch();
  const currentProjectSet = useSelector(
    (state: AppState) => state.projectSet.currentProjectSet,
  ) as UserProjectSet;
  const [submitting, setSubmitting] = useState(false);

  // id 改变时，获取初始值
  useEffect(() => {
    form.setFieldsValue(toLowerCamelCase(currentProjectSet));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectSet.id]);

  const handleFinish = (values: any) => {
    setSubmitting(true);
    api
      .editProjectSet({ id: currentProjectSet.id, data: values })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        // 修改成功
        dispatch(editProjectSet(data.projectSet));
        dispatch(setCurrentProjectSet(data.projectSet));
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
        max-width: ${style.contentMaxWidth}px;
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
            {formatMessage({ id: 'site.save' })}
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};
