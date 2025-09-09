import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Divider,
  Typography,
} from 'antd';
import * as LlmService from '@/services/ai/llm_preprocess';

interface ModelConfigFormProps {
  initialValue?: LlmService.LLMConf;
  onChange?: (config: LlmService.LLMConf) => void;
}

export const ModelConfigForm: React.FC<ModelConfigFormProps> = ({
  initialValue,
  onChange,
}) => {
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
      }
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
      <Typography.Title level={5}>Configure LLM Model</Typography.Title>
      <p>
        Please provide the LLM API configuration used to translate the images.
      </p>
      <p>
        The LLM API should use the OpenAI-compatible format and API key
        authencation. The model should support image input and structured
        output.
      </p>
      <p>This configuration is only used and saved inside in your browser.</p>
      <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
        <Form.Item label="Presets" name="preset">
          <Select
            placeholder="Please pick a preset"
            onChange={handlePresetChange}
          >
            {LlmService.llmPresets.map((preset, i) => (
              <Select.Option key={i} value={i}>
                {preset.provider} / {preset.model}
              </Select.Option>
            ))}
            <Select.Option key={-1} value={-1}>
              Custom
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Model"
          name="model"
          rules={[{ required: true, message: 'Please enter the model name' }]}
        >
          <Input
            placeholder="e.g., gemini-2.5-flash, gpt-4-vision-preview"
            autoComplete="llm-model"
          />
        </Form.Item>

        <Form.Item
          label="API Base URL"
          name="baseUrl"
          rules={[
            { required: true, message: 'Please enter the base URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]}
        >
          <Input
            placeholder="https://api.example.com/v1/"
            maxLength={200}
            autoComplete="llm-base-url"
          />
        </Form.Item>

        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[{ required: true, message: 'Please enter your API key' }]}
        >
          <Input.Password placeholder="Enter your API key" autoComplete="off" />
        </Form.Item>
      </Form>

      <Divider />
    </div>
  );
};
