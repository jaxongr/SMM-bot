import { Form, Input, InputNumber, Switch, Button, Card, Spin, Divider, Typography } from 'antd';
import { SaveOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import type { Setting } from '../../../shared/types';

const { Title } = Typography;

interface PaymentSettingsProps {
  settings: Setting[];
  loading: boolean;
  onSave: (values: { key: string; value: unknown }[]) => void;
  saving: boolean;
}

function getSettingValue(settings: Setting[], key: string, defaultVal: unknown = ''): unknown {
  const found = settings.find((s) => s.key === key);
  return found ? found.value : defaultVal;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({
  settings,
  loading,
  onSave,
  saving,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (settings.length > 0) {
      form.setFieldsValue({
        payment_card_number: String(getSettingValue(settings, 'payment_card_number', '8600 0000 0000 0000')),
        payment_card_holder: String(getSettingValue(settings, 'payment_card_holder', 'SMM Bot Admin')),
        min_topup_amount: Number(getSettingValue(settings, 'min_topup_amount', 1000)),
        max_topup_amount: Number(getSettingValue(settings, 'max_topup_amount', 10000000)),
        click_enabled: Boolean(getSettingValue(settings, 'click_enabled', false)),
        payme_enabled: Boolean(getSettingValue(settings, 'payme_enabled', false)),
        crypto_enabled: Boolean(getSettingValue(settings, 'crypto_enabled', false)),
      });
    }
  }, [settings, form]);

  const handleFinish = (values: Record<string, unknown>) => {
    const entries = Object.entries(values).map(([key, val]) => ({
      key,
      value: val,
    }));
    onSave(entries);
  };

  if (loading) {
    return <Spin tip="Yuklanmoqda..." style={{ width: '100%', padding: 48 }} />;
  }

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Title level={5}>
          <CreditCardOutlined /> Bank karta sozlamalari
        </Title>
        <p style={{ color: '#888', marginBottom: 16 }}>
          Foydalanuvchilar to'lov qilish uchun shu karta raqamni ko'radi
        </p>

        <Form.Item
          label="Karta raqami (Uzcard/Humo)"
          name="payment_card_number"
          rules={[{ required: true, message: 'Karta raqamini kiriting' }]}
        >
          <Input
            placeholder="8600 1234 5678 9012"
            style={{ width: 300, fontSize: 18 }}
          />
        </Form.Item>

        <Form.Item
          label="Karta egasi"
          name="payment_card_holder"
          rules={[{ required: true, message: 'Karta egasini kiriting' }]}
        >
          <Input
            placeholder="Ism Familiya"
            style={{ width: 300 }}
          />
        </Form.Item>

        <Divider />

        <Title level={5}>To'lov sozlamalari</Title>

        <Form.Item label="Minimal to'lov summasi (so'm)" name="min_topup_amount">
          <InputNumber min={0} style={{ width: 250 }} />
        </Form.Item>

        <Form.Item label="Maksimal to'lov summasi (so'm)" name="max_topup_amount">
          <InputNumber min={0} style={{ width: 250 }} />
        </Form.Item>

        <Divider />

        <Title level={5}>To'lov usullari</Title>

        <Form.Item
          label="Click yoqilsinmi"
          name="click_enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Payme yoqilsinmi"
          name="payme_enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          label="Crypto yoqilsinmi"
          name="crypto_enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={saving}
            size="large"
          >
            Saqlash
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PaymentSettings;
