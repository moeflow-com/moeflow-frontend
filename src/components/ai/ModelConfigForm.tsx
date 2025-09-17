import React, { useEffect } from 'react';
import { Form, Input, Select, Divider, Typography } from 'antd';
import * as LlmService from '@/services/ai/llm_preprocess';
import { useIntl } from 'react-intl';

interface ModelConfigFormProps {
  initialValue?: LlmService.LLMConf;
  onChange?: (config: LlmService.LLMConf) => void;
}

export const ModelConfigForm: React.FC<ModelConfigFormProps> = ({
  initialValue,
  onChange,
}) => {
  const { formatMessage } = useIntl();
  const [form] = Form.useForm();

  // Find matching preset index for initial value
  const findPresetIndex = (config: LlmService.LLMConf): number => {
    const index = LlmService.llmPresets.findIndex(
      (preset) =>
        preset.model === config.model && preset.baseUrl === config.baseUrl,
    );
    return index >= 0 ? index : -1; // -1 for custom
  };

  useEffect(() => {
    if (initialValue) {
      const presetIndex = findPresetIndex(initialValue);
      form.setFieldsValue({
        preset: presetIndex,
        model: initialValue.model,
        baseUrl: initialValue.baseUrl,
        apiKey: initialValue.apiKey,
      });
    }
  }, [initialValue, form]);

  // Handle preset selection change
  const handlePresetChange = (presetIndex: number) => {
    if (presetIndex >= 0 && presetIndex < LlmService.llmPresets.length) {
      const preset = LlmService.llmPresets[presetIndex];
      const patch = {
        model: preset.model,
        baseUrl: preset.baseUrl,
        apiKey: preset.apiKey || '',
      };
      form.setFieldsValue(patch);
      handleFormChange(patch, form.getFieldsValue());
    }
    // For custom preset (index -1), don't auto-fill fields
  };

  // Handle form values change
  const handleFormChange = (changedValues: any, allValues: any) => {
    // Check if model or baseUrl was changed and update preset accordingly
    if (
      changedValues.model !== undefined ||
      changedValues.baseUrl !== undefined
    ) {
      const currentModel = allValues.model || changedValues.model;
      const currentBaseUrl = allValues.baseUrl || changedValues.baseUrl;

      // Find matching preset
      const matchingPresetIndex = LlmService.llmPresets.findIndex(
        (preset) =>
          preset.model === currentModel && preset.baseUrl === currentBaseUrl,
      );

      // Update preset to match the current values
      if (matchingPresetIndex >= 0) {
        // Found a matching preset, switch to it
        if (allValues.preset !== matchingPresetIndex) {
          form.setFieldValue('preset', matchingPresetIndex);
        }
      } else {
        // No preset matches, set to custom (-1)
        if (allValues.preset !== -1) {
          form.setFieldValue('preset', -1);
        }
      }
    }

    const values = form.getFieldsValue();
    // Get provider from selected preset if available
    let provider = '';
    if (values.preset >= 0 && values.preset < LlmService.llmPresets.length) {
      provider = LlmService.llmPresets[values.preset].provider;
    }

    const config: LlmService.LLMConf = {
      provider,
      model: values.model,
      baseUrl: values.baseUrl,
      apiKey: values.apiKey,
    };
    onChange?.(config);
  };
  return (
    <div>
      <Typography.Title level={5}>
        {formatMessage({ id: 'fileList.aiTranslate.configModal.title' })}
      </Typography.Title>
      <p>
        {formatMessage({ id: 'fileList.aiTranslate.configModal.modelDesc' })}
      </p>
      <p>
        {formatMessage({
          id: 'fileList.aiTranslate.configModal.modelRequirements',
        })}
      </p>
      <p>
        {formatMessage({
          id: 'fileList.aiTranslate.configModal.configsAreLocal',
        })}
      </p>
      <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
        <Form.Item
          label={formatMessage({
            id: 'fileList.aiTranslate.configModal.presets.label',
          })}
          name="preset"
        >
          <Select
            placeholder={formatMessage({
              id: 'fileList.aiTranslate.configModal.presets.placeholder',
            })}
            onChange={handlePresetChange}
          >
            {LlmService.llmPresets.map((preset, i) => (
              <Select.Option key={i} value={i}>
                {preset.provider} / {preset.model}
              </Select.Option>
            ))}
            <Select.Option key={-1} value={-1}>
              {formatMessage({
                id: 'fileList.aiTranslate.configModal.presets.custom',
              })}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={formatMessage({
            id: 'fileList.aiTranslate.configModal.model.label',
          })}
          name="model"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'fileList.aiTranslate.configModal.model.required',
              }),
            },
          ]}
        >
          <Input
            placeholder="e.g., gemini-2.5-flash, gpt-4-vision-preview"
            autoComplete="llm-model"
          />
        </Form.Item>

        <Form.Item
          label={formatMessage({
            id: 'fileList.aiTranslate.configModal.baseUrl.label',
          })}
          name="baseUrl"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'fileList.aiTranslate.configModal.baseUrl.required',
              }),
            },
            {
              type: 'url',
              message: formatMessage({
                id: 'fileList.aiTranslate.configModal.baseUrl.invalidUrl',
              }),
            },
          ]}
        >
          <Input
            placeholder="https://api.example.com/v1/"
            maxLength={200}
            autoComplete="llm-base-url"
          />
        </Form.Item>

        <Form.Item
          label={formatMessage({
            id: 'fileList.aiTranslate.configModal.apiKey.label',
          })}
          name="apiKey"
          rules={[
            {
              required: true,
              message: formatMessage({
                id: 'fileList.aiTranslate.configModal.apiKey.required',
              }),
            },
          ]}
        >
          <Input.Password placeholder="Enter your API key" autoComplete="off" />
        </Form.Item>
      </Form>

      <Divider />
    </div>
  );
};
