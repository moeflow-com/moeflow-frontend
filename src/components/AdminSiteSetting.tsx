import { css } from '@emotion/core';
import { Button, Form as AntdForm, Input, message, Spin, Switch } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import classNames from 'classnames';
import { values } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import apis from '../apis';
import { APISiteSetting } from '../apis/siteSetting';
import { FC } from '../interfaces';
import { toLowerCamelCase } from '../utils';
import { Form } from './Form';
import { FormItem } from './FormItem';

/** 站点设置的属性接口 */
interface AdminSiteSettingProps {
  className?: string;
}
/**
 * 站点设置
 */
export const AdminSiteSetting: FC<AdminSiteSettingProps> = ({ className }) => {
  const { formatMessage } = useIntl();

  const [form] = AntdForm.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [siteSetting, setSiteSetting] = useState<APISiteSetting | null>(null);

  interface APISiteSettingFormData
    extends Omit<APISiteSetting, 'whitelistEmails'> {
    whitelistEmails: string;
  }

  const handleFinish = (values: APISiteSettingFormData) => {
    apis
      .editSiteSetting({
        data: {
          ...values,
          whitelistEmails:
            values.whitelistEmails.trim() === ''
              ? []
              : values.whitelistEmails
                  .split('\n')
                  .map((item) => item.trim())
                  .filter((item) => item !== ''),
        },
      })
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        data.whitelistEmails = data.whitelistEmails.join('\n');
        form.setFieldsValue(data);
        // 弹出提示
        message.success(formatMessage({ id: 'site.setting.editSuccess' }));
      })
      .catch((error) => {
        console.log(error);
        if (error.data?.message?.whitelistEmails) {
          const line = error.data.message.whitelistEmails
            .map((line: number) => line + 1)
            .join(', ');
          error.data.message.whitelistEmails = [
            formatMessage(
              { id: 'site.setting.whitelistEmailsError' },
              { line }
            ),
          ];
        }

        error.default(form);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  useEffect(() => {
    apis
      .getSiteSetting({})
      .then((result) => {
        const data = toLowerCamelCase(result.data);
        data.whitelistEmails = data.whitelistEmails.join('\n');
        setSiteSetting(data);
        form.setFieldsValue(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return loading ? (
    <Spin />
  ) : (
    <div className={classNames('AdminSiteSetting', className)} css={css``}>
      <Form form={form} onFinish={handleFinish} autoComplete="off">
        <FormItem
          label={formatMessage({ id: 'site.setting.enableWhitelist' })}
          name="enableWhitelist"
        >
          <Switch defaultChecked={siteSetting?.enableWhitelist} />
        </FormItem>
        <FormItem
          label={formatMessage({ id: 'site.setting.whitelistEmails' })}
          name="whitelistEmails"
          tooltip={formatMessage({ id: 'site.setting.whitelistEmailsTip' })}
        >
          <TextArea rows={10} />
        </FormItem>

        <FormItem wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {formatMessage({ id: 'form.submit' })}
          </Button>
        </FormItem>
      </Form>
    </div>
  );
};
