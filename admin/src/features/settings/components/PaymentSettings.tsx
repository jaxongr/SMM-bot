import { Form, InputNumber, Switch, Button, Card, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import type { Setting } from '../../../shared/types';

interface PaymentSettingsProps {
  settings: Setting[];
  loading: boolean;
  onSave: (values: { key: string; value: string }[]) => void;
  saving: boolean;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({
  settings,
  loading,
  onSave,
  saving,
}) => {
  const [form] = Form.useForm();

  const settingsMap = useMemo(() => {
    const map: Record<string, string> = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return map;
  }, [settings]);

  useEffect(() => {
    if (settings.length > 0) {
      form.setFieldsValue({
        min_topup_amount: Number(settingsMap['min_topup_amount'] ?? 1000),
        max_topup_amount: Number(
          settingsMap['max_topup_amount'] ?? 10000000,
        ),
        click_enabled: settingsMap['click_enabled'] === 'true',
        payme_enabled: settingsMap['payme_enabled'] === 'true',
        crypto_enabled: settingsMap['crypto_enabled'] === 'true',
      });
    }
  }, [settings, settingsMap, form]);

  const handleFinish = (values: Record<string, unknown>) => {
    const entries: { key: string; value: string }[] = Object.entries(values).map(
      ([key, val]) => ({
        key,
        value: String(val),
      }),
    );
    onSave(entries);
  };

  if (loading) {
    return <Spin tip="Loading settings..." style={{ width: '100%', padding: 48 }} />;
  }

  return (
    <Card>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item label="Min Top-up Amount (UZS)" name="min_topup_amount">
          <InputNumber min={0} style={{ width: 250 }} />
        </Form.Item>
        <Form.Item label="Max Top-up Amount (UZS)" name="max_topup_amount">
          <InputNumber min={0} style={{ width: 250 }} />
        </Form.Item>
        <Form.Item
          label="Click Enabled"
          name="click_enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="Payme Enabled"
          name="payme_enabled"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          label="Crypto Enabled"
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
          >
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PaymentSettings;
