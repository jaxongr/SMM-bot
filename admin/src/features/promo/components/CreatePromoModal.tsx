import { useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { CreatePromoPayload, PromoType } from '../api/promo.api';
import { useCreatePromo } from '../hooks/usePromo';

interface CreatePromoModalProps {
  open: boolean;
  onClose: () => void;
}

const PROMO_TYPE_OPTIONS: { value: PromoType; label: string }[] = [
  { value: 'BALANCE_BONUS', label: 'Balans bonus' },
  { value: 'DISCOUNT_PERCENT', label: 'Chegirma (%)' },
  { value: 'DISCOUNT_FIXED', label: "Chegirma (so'm)" },
];

function generatePromoCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const CreatePromoModal: React.FC<CreatePromoModalProps> = ({ open, onClose }) => {
  const [form] = Form.useForm<CreatePromoPayload>();
  const { mutate: createPromo, isPending } = useCreatePromo();
  const [selectedType, setSelectedType] = useState<PromoType>('BALANCE_BONUS');

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const payload: CreatePromoPayload = {
        ...values,
        expiresAt: values.expiresAt
          ? (values.expiresAt as unknown as { toISOString: () => string }).toISOString()
          : null,
        maxUsages: values.maxUsages ?? null,
        description: values.description ?? null,
      };

      createPromo(payload, {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      });
    });
  };

  const handleGenerateCode = () => {
    form.setFieldValue('code', generatePromoCode());
  };

  return (
    <Modal
      title="Yangi promo kod"
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isPending}
      okText="Yaratish"
      cancelText="Bekor qilish"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ type: 'BALANCE_BONUS' }}>
        <Form.Item
          name="code"
          label="Promo kod"
          rules={[{ required: true, message: 'Promo kodni kiriting' }]}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="PROMO2024"
              style={{ textTransform: 'uppercase' }}
            />
            <Button icon={<ReloadOutlined />} onClick={handleGenerateCode}>
              Generatsiya
            </Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          name="type"
          label="Turi"
          rules={[{ required: true, message: 'Turini tanlang' }]}
        >
          <Select
            options={PROMO_TYPE_OPTIONS}
            onChange={(val: PromoType) => setSelectedType(val)}
          />
        </Form.Item>

        <Form.Item
          name="value"
          label={selectedType === 'DISCOUNT_PERCENT' ? 'Qiymat (%)' : "Qiymat (so'm)"}
          rules={[{ required: true, message: 'Qiymatni kiriting' }]}
        >
          <InputNumber
            min={1}
            max={selectedType === 'DISCOUNT_PERCENT' ? 100 : undefined}
            style={{ width: '100%' }}
            placeholder={selectedType === 'DISCOUNT_PERCENT' ? '10' : '5000'}
          />
        </Form.Item>

        <Form.Item name="maxUsages" label="Maks. foydalanish soni (ixtiyoriy)">
          <InputNumber min={1} style={{ width: '100%' }} placeholder="Cheksiz" />
        </Form.Item>

        <Form.Item name="expiresAt" label="Amal muddati (ixtiyoriy)">
          <DatePicker
            showTime
            style={{ width: '100%' }}
            placeholder="Tanlang"
            format="DD.MM.YYYY HH:mm"
          />
        </Form.Item>

        <Form.Item name="description" label="Tavsif (ixtiyoriy)">
          <Input.TextArea rows={3} placeholder="Promo kod haqida ma'lumot..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
