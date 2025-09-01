import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Space,
  Divider,
  Typography,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

interface MultimodalModelConf {
  provider: string;
  model: string;
  baseUrl: string;
}

interface ModelConfigFormProps {
  initialValue?: MultimodalModelConf;
  onSave?: (config: MultimodalModelConf) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const ModelConfigForm: React.FC<ModelConfigFormProps> = ({
  initialValue,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValue) {
      form.setFieldsValue(initialValue);
    }
  }, [initialValue, form]);

  const handleSubmit = async (values: MultimodalModelConf) => {
    try {
      if (onSave) {
        await onSave(values);
        message.success('Configuration saved successfully');
      }
    } catch (error) {
      message.error('Failed to save configuration');
      console.error('Save error:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleReset = () => {
    form.resetFields();
    if (initialValue) {
      form.setFieldsValue(initialValue);
    }
  };

  return (
    <Card title="LLM Model Configuration" style={{ maxWidth: 600 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={
          initialValue || {
            provider: 'gemini',
            model: 'gemini-2.5-flash',
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
          }
        }
      >
        <Form.Item
          label="Provider"
          name="provider"
          rules={[{ required: true, message: 'Please select a provider' }]}
        >
          <Select placeholder="Select AI provider">
            <Option value="gemini">Google Gemini</Option>
            <Option value="openai">OpenAI</Option>
            <Option value="anthropic">Anthropic</Option>
            <Option value="custom">Custom</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Model"
          name="model"
          rules={[{ required: true, message: 'Please enter the model name' }]}
        >
          <Input
            placeholder="e.g., gemini-2.5-flash, gpt-4-vision-preview"
            showCount
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          label="Base URL"
          name="baseUrl"
          rules={[
            { required: true, message: 'Please enter the base URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]}
        >
          <Input
            placeholder="https://api.example.com/v1/"
            showCount
            maxLength={200}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Save Configuration
            </Button>
            <Button onClick={handleReset}>Reset</Button>
            <Button onClick={handleCancel}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>

      <Divider />

      <div>
        <Title level={5}>Preset Configurations</Title>
        <Text type="secondary">
          Common configurations for popular AI providers:
        </Text>

        <div style={{ marginTop: 16 }}>
          <Text strong>Google Gemini:</Text>
          <div style={{ marginLeft: 16, marginTop: 8 }}>
            <div>• Provider: gemini</div>
            <div>• Model: gemini-2.5-flash, gemini-2.5-pro</div>
            <div>
              • Base URL:
              https://generativelanguage.googleapis.com/v1beta/openai/
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Text strong>OpenAI:</Text>
          <div style={{ marginLeft: 16, marginTop: 8 }}>
            <div>• Provider: openai</div>
            <div>• Model: gpt-4-vision-preview, gpt-4o</div>
            <div>• Base URL: https://api.openai.com/v1/</div>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Text strong>Anthropic:</Text>
          <div style={{ marginLeft: 16, marginTop: 8 }}>
            <div>• Provider: anthropic</div>
            <div>• Model: claude-3-5-sonnet, claude-3-opus</div>
            <div>• Base URL: https://api.anthropic.com/v1/</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

ModelConfigForm;
