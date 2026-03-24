import { Modal, Form, Input, Select } from 'antd';
import { useEffect, useState } from 'react';
import type { NotificationTarget } from '../../../shared/types';
import type { CreateNotificationDto } from '../api/notifications.api';

const { TextArea } = Input;

interface BroadcastModalProps {
  open: boolean;
  onSubmit: (values: CreateNotificationDto) => void;
  onCancel: () => void;
  loading: boolean;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({
  open,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [form] = Form.useForm<CreateNotificationDto>();
  const [targetType, setTargetType] = useState<NotificationTarget>('ALL');

  useEffect(() => {
    if (open) {
      form.resetFields();
      setTargetType('ALL');
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
      title="Send Broadcast Notification"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ target: 'ALL' }}>
        <Form.Item
          label="Title (UZ)"
          name="titleUz"
          rules={[{ required: true, message: 'Title in Uzbek is required' }]}
        >
          <Input placeholder="Sarlavha (uz)" />
        </Form.Item>
        <Form.Item label="Title (RU)" name="titleRu">
          <Input placeholder="Заголовок (ru)" />
        </Form.Item>
        <Form.Item label="Title (EN)" name="titleEn">
          <Input placeholder="Title (en)" />
        </Form.Item>

        <Form.Item
          label="Message (UZ)"
          name="messageUz"
          rules={[{ required: true, message: 'Message in Uzbek is required' }]}
        >
          <TextArea rows={3} placeholder="Xabar matni (uz)" />
        </Form.Item>
        <Form.Item label="Message (RU)" name="messageRu">
          <TextArea rows={3} placeholder="Текст сообщения (ru)" />
        </Form.Item>
        <Form.Item label="Message (EN)" name="messageEn">
          <TextArea rows={3} placeholder="Message text (en)" />
        </Form.Item>

        <Form.Item
          label="Target"
          name="target"
          rules={[{ required: true, message: 'Please select target' }]}
        >
          <Select
            options={[
              { label: 'All Users', value: 'ALL' },
              { label: 'Specific User', value: 'USER' },
              { label: 'By Role', value: 'ROLE' },
            ]}
            onChange={(val) => setTargetType(val as NotificationTarget)}
          />
        </Form.Item>

        {(targetType === 'USER' || targetType === 'ROLE') && (
          <Form.Item
            label={targetType === 'USER' ? 'User ID' : 'Role'}
            name="targetId"
            rules={[
              {
                required: true,
                message: `Please enter ${targetType === 'USER' ? 'user ID' : 'role'}`,
              },
            ]}
          >
            {targetType === 'USER' ? (
              <Input placeholder="Enter user ID or telegram ID" />
            ) : (
              <Select
                placeholder="Select role"
                options={[
                  { label: 'User', value: 'USER' },
                  { label: 'Admin', value: 'ADMIN' },
                  { label: 'Moderator', value: 'MODERATOR' },
                ]}
              />
            )}
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default BroadcastModal;
