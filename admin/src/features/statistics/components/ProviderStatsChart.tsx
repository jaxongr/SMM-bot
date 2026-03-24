import { Card, Spin, Empty } from 'antd';
import { Column } from '@ant-design/charts';
import type { ProviderStatsData } from '../../../shared/types';

interface ProviderStatsChartProps {
  data: ProviderStatsData[];
  loading: boolean;
}

const ProviderStatsChart: React.FC<ProviderStatsChartProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <Card title="Provider Statistics">
        <Spin tip="Loading..." style={{ width: '100%', padding: 48 }} />
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card title="Provider Statistics">
        <Empty description="No provider statistics" />
      </Card>
    );
  }

  const chartData = data.flatMap((provider) => [
    { name: provider.name, value: provider.orders, metric: 'Orders' },
    { name: provider.name, value: provider.spending, metric: 'Spending ($)' },
    {
      name: provider.name,
      value: provider.successRate,
      metric: 'Success Rate (%)',
    },
  ]);

  const config = {
    data: chartData,
    xField: 'name',
    yField: 'value',
    seriesField: 'metric',
    isGroup: true,
    legend: { position: 'top' as const },
    label: { position: 'top' as const },
  };

  return (
    <Card title="Provider Comparison">
      <Column {...config} height={350} />
    </Card>
  );
};

export default ProviderStatsChart;
