import { Form, InputNumber, Button, Card, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import type { Setting } from '../../../shared/types';

interface ReferralSettingsProps {
  settings: Setting[];
  loading: boolean;
  onSave: (values: { key: string; value: string }[]) => void;
  saving: boolean;
}

const ReferralSettings: React.FC<ReferralSettingsProps> = ({
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
        referral_percentage: Number(
          settingsMap['referral_percentage'] ?? 5,
        ),
        min_referral_payout: Number(
          settingsMap['min_referral_payout'] ?? 10000,
        ),
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
        <Form.Item label="Referral Percentage (%)" name="referral_percentage">
          <InputNumber min={0} max={100} step={0.5} style={{ width: 200 }} />
        </Form.Item>
        <Form.Item
          label="Min Referral Payout (UZS)"
          name="min_referral_payout"
        >
          <InputNumber min={0} style={{ width: 250 }} />
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

export default ReferralSettings;
