import { useCallback } from 'react';
import { Typography, Tabs } from 'antd';
import styled from 'styled-components';
import GeneralSettings from './components/GeneralSettings';
import PaymentSettings from './components/PaymentSettings';
import BotSettings from './components/BotSettings';
import ReferralSettings from './components/ReferralSettings';
import { useSettings, useBulkUpdateSettings } from './hooks/useSettings';

const PageWrapper = styled.div`
  padding: 24px;
`;

const SettingsPage: React.FC = () => {
  const { data, isLoading } = useSettings();
  const bulkUpdate = useBulkUpdateSettings();

  const settings = data?.data ?? [];

  const handleSave = useCallback(
    (values: { key: string; value: string }[]) => {
      bulkUpdate.mutate(values);
    },
    [bulkUpdate],
  );

  const tabItems = [
    {
      key: 'general',
      label: 'General',
      children: (
        <GeneralSettings
          settings={settings}
          loading={isLoading}
          onSave={handleSave}
          saving={bulkUpdate.isPending}
        />
      ),
    },
    {
      key: 'payments',
      label: 'Payments',
      children: (
        <PaymentSettings
          settings={settings}
          loading={isLoading}
          onSave={handleSave}
          saving={bulkUpdate.isPending}
        />
      ),
    },
    {
      key: 'bot',
      label: 'Bot',
      children: (
        <BotSettings
          settings={settings}
          loading={isLoading}
          onSave={handleSave}
          saving={bulkUpdate.isPending}
        />
      ),
    },
    {
      key: 'referral',
      label: 'Referral',
      children: (
        <ReferralSettings
          settings={settings}
          loading={isLoading}
          onSave={handleSave}
          saving={bulkUpdate.isPending}
        />
      ),
    },
  ];

  return (
    <PageWrapper>
      <Typography.Title level={2}>Settings</Typography.Title>
      <Tabs items={tabItems} defaultActiveKey="general" />
    </PageWrapper>
  );
};

export { SettingsPage };
export default SettingsPage;
