import { Modal, Form, Input, InputNumber } from 'antd';
import { useEffect } from 'react';
import type { Provider } from '../../../shared/types';
import type { CreateProviderDto } from '../api/providers.api';

interface ProviderFormModalProps {
  open: boolean;
  editingProvider: Provider | null;
  onSubmit: (values: CreateProviderDto) => void;
  onCancel: () => void;
  loading: boolean;
}

const ProviderFormModal: React.FC<ProviderFormModalProps> = ({
  open,
  editingProvider,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [form] = Form.useForm<CreateProviderDto>();

  useEffect(() => {
    if (open && editingProvider) {
      form.setFieldsValue({
        name: editingProvider.name,
        apiUrl: editingProvider.apiUrl,
        apiKey: editingProvider.apiKey,
        description: editingProvider.description || '',
        priority: editingProvider.priority,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingProvider, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      // validation error
    }
  };

  return (
    <Modal
      title={editingProvider ? 'Edit Provider' : 'Create Provider'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ priority: 1 }}>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter provider name' }]}
        >
          <Input placeholder="e.g. SmmPanel" />
        </Form.Item>
        <Form.Item
          label="API URL"
          name="apiUrl"
          rules={[
            { required: true, message: 'Please enter API URL' },
            { type: 'url', message: 'Please enter a valid URL' },
          ]}
        >
          <Input placeholder="https://example.com/api/v2" />
        </Form.Item>
        <Form.Item
          label="API Key"
          name="apiKey"
          rules={[{ required: true, message: 'Please enter API key' }]}
        >
          <Input.Password placeholder="API key" />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
        <Form.Item
          label="Priority"
          name="priority"
          rules={[{ required: true, message: 'Please enter priority' }]}
        >
          <InputNumber min={1} max={100} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProviderFormModal;
