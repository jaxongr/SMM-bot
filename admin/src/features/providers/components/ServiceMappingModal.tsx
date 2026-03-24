import { Modal, Form, Select, InputNumber } from 'antd';
import { useEffect } from 'react';
import type { Provider, ProviderService } from '../../../shared/types';
import type { CreateMappingDto } from '../api/providers.api';

interface ServiceMappingModalProps {
  open: boolean;
  providers: Provider[];
  providerServices: ProviderService[];
  localServices: { id: string; name: string }[];
  onSubmit: (values: CreateMappingDto) => void;
  onCancel: () => void;
  onProviderChange: (providerId: string) => void;
  loading: boolean;
}

const ServiceMappingModal: React.FC<ServiceMappingModalProps> = ({
  open,
  providers,
  providerServices,
  localServices,
  onSubmit,
  onCancel,
  onProviderChange,
  loading,
}) => {
  const [form] = Form.useForm<CreateMappingDto>();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

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
      title="Create Service Mapping"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ priority: 1 }}>
        <Form.Item
          label="Local Service"
          name="serviceId"
          rules={[{ required: true, message: 'Please select a local service' }]}
        >
          <Select
            placeholder="Select local service"
            showSearch
            optionFilterProp="label"
            options={localServices.map((s) => ({
              label: s.name,
              value: s.id,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Provider"
          name="providerId"
          rules={[{ required: true, message: 'Please select a provider' }]}
        >
          <Select
            placeholder="Select provider"
            options={providers
              .filter((p) => p.isActive)
              .map((p) => ({
                label: p.name,
                value: p.id,
              }))}
            onChange={(val) => onProviderChange(val as string)}
          />
        </Form.Item>
        <Form.Item
          label="Provider Service"
          name="providerServiceId"
          rules={[
            { required: true, message: 'Please select a provider service' },
          ]}
        >
          <Select
            placeholder="Select provider service"
            showSearch
            optionFilterProp="label"
            options={providerServices.map((s) => ({
              label: `[${s.externalId}] ${s.name} — $${s.rate}`,
              value: s.id,
            }))}
          />
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

export default ServiceMappingModal;
