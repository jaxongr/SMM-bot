import { useState, useMemo } from 'react';
import { Typography, Tabs, Space } from 'antd';
import styled from 'styled-components';
import dayjs, { type Dayjs } from 'dayjs';
import RevenueChart from './components/RevenueChart';
import OrdersChart from './components/OrdersChart';
import UserGrowthChart from './components/UserGrowthChart';
import ProviderStatsChart from './components/ProviderStatsChart';
import DateRangePickerComponent from './components/DateRangePicker';
import ExportButton from './components/ExportButton';
import {
  useRevenueChart,
  useOrdersStats,
  useUserGrowth,
  useProviderStats,
} from './hooks/useStatistics';
import type { DateRangeParams } from './api/statistics.api';

const PageWrapper = styled.div`
  padding: 24px;
`;

const TabHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const StatisticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  const params: DateRangeParams = useMemo(
    () => ({
      dateFrom: dateRange[0].toISOString(),
      dateTo: dateRange[1].toISOString(),
    }),
    [dateRange],
  );

  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueChart(params);
  const { data: ordersData, isLoading: ordersLoading } =
    useOrdersStats(params);
  const { data: usersData, isLoading: usersLoading } = useUserGrowth(params);
  const { data: providerData, isLoading: providerLoading } =
    useProviderStats();

  const tabItems = [
    {
      key: 'revenue',
      label: 'Revenue',
      children: (
        <>
          <TabHeader>
            <DateRangePickerComponent
              value={dateRange}
              onChange={setDateRange}
            />
            <ExportButton
              data={(revenueData?.data ?? []) as unknown as Record<string, unknown>[]}
              filename="revenue-stats"
            />
          </TabHeader>
          <RevenueChart
            data={revenueData?.data ?? []}
            loading={revenueLoading}
          />
        </>
      ),
    },
    {
      key: 'orders',
      label: 'Orders',
      children: (
        <>
          <TabHeader>
            <DateRangePickerComponent
              value={dateRange}
              onChange={setDateRange}
            />
            <Space>
              <ExportButton
                data={
                  (ordersData?.data?.byStatus ?? []) as unknown as Record<
                    string,
                    unknown
                  >[]
                }
                filename="orders-by-status"
              />
              <ExportButton
                data={
                  (ordersData?.data?.byPlatform ?? []) as unknown as Record<
                    string,
                    unknown
                  >[]
                }
                filename="orders-by-platform"
              />
            </Space>
          </TabHeader>
          <OrdersChart
            data={ordersData?.data ?? null}
            loading={ordersLoading}
          />
        </>
      ),
    },
    {
      key: 'users',
      label: 'Users',
      children: (
        <>
          <TabHeader>
            <DateRangePickerComponent
              value={dateRange}
              onChange={setDateRange}
            />
            <ExportButton
              data={(usersData?.data ?? []) as unknown as Record<string, unknown>[]}
              filename="user-growth"
            />
          </TabHeader>
          <UserGrowthChart
            data={usersData?.data ?? []}
            loading={usersLoading}
          />
        </>
      ),
    },
    {
      key: 'providers',
      label: 'Providers',
      children: (
        <>
          <TabHeader>
            <div />
            <ExportButton
              data={
                (providerData?.data ?? []) as unknown as Record<
                  string,
                  unknown
                >[]
              }
              filename="provider-stats"
            />
          </TabHeader>
          <ProviderStatsChart
            data={providerData?.data ?? []}
            loading={providerLoading}
          />
        </>
      ),
    },
  ];

  return (
    <PageWrapper>
      <Typography.Title level={2}>Statistics</Typography.Title>
      <Tabs items={tabItems} defaultActiveKey="revenue" />
    </PageWrapper>
  );
};

export { StatisticsPage };
export default StatisticsPage;
