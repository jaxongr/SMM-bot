import { useState } from 'react';
import { Card, Segmented, Spin } from 'antd';
import { Line } from '@ant-design/charts';
import styled from 'styled-components';
import { useRevenueChart } from '@/features/dashboard/hooks/useDashboardStats';

const ChartWrapper = styled.div`
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const periodOptions = [
  { label: '7 kun', value: '7d' },
  { label: '30 kun', value: '30d' },
  { label: '90 kun', value: '90d' },
];

export function RevenueChart() {
  const [period, setPeriod] = useState('30d');
  const { data, isLoading } = useRevenueChart(period);

  const chartData = data?.data || [];

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    color: '#722ED1',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: Record<string, unknown>) => ({
        name: 'Daromad',
        value: `${Number(datum['revenue']).toLocaleString()} so'm`,
      }),
    },
    xAxis: {
      tickCount: 7,
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${(Number(v) / 1000).toFixed(0)}k`,
      },
    },
  };

  return (
    <Card
      title="Daromad"
      extra={
        <Segmented
          options={periodOptions}
          value={period}
          onChange={(val) => setPeriod(val as string)}
          size="small"
        />
      }
      style={{ borderRadius: 12 }}
    >
      <ChartWrapper>
        {isLoading ? (
          <Spin size="large" />
        ) : chartData.length > 0 ? (
          <Line {...config} />
        ) : (
          <span>Ma'lumot topilmadi</span>
        )}
      </ChartWrapper>
    </Card>
  );
}
