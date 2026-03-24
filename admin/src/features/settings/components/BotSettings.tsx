import { Form, Input, Button, Card, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import type { Setting } from '../../../shared/types';

const { TextArea } = Input;

interface BotSettingsProps {
  settings: Setting[];
  loading: boolean;
  onSave: (values: { key: string; value: string }[]) => void;
  saving: boolean;
}

const BotSettings: React.FC<BotSettingsProps> = ({
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
        support_telegram_username:
          settingsMap['support_telegram_username'] ?? '',
        welcome_message: settingsMap['welcome_message'] ?? '',
        maintenance_message: settingsMap['maintenance_message'] ?? '',
      });
    }
  }, [settings, settingsMap, form]);

  const handleFinish = (values: Record<string, unknown>) => {
    const entries: { key: string; value: string }[] = Object.entries(values).map(
      ([key, val]) => ({
        key,
        value: String(val ?? ''),
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
        <Form.Item
          label="Support Telegram Username"
          name="support_telegram_username"
        >
          <Input
            placeholder="@username"
            addonBefore="@"
            style={{ width: 300 }}
          />
        </Form.Item>
        <Form.Item label="Welcome Message" name="welcome_message">
          <TextArea rows={4} placeholder="Welcome message for new users" />
        </Form.Item>
        <Form.Item label="Maintenance Message" name="maintenance_message">
          <TextArea
            rows={4}
            placeholder="Message shown during maintenance mode"
          />
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

export default BotSettings;
