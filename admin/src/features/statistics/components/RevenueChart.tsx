import { Card, Spin, Empty } from 'antd';
import { Line } from '@ant-design/charts';
import type { RevenueDataPoint } from '../../../shared/types';

interface RevenueChartProps {
  data: RevenueDataPoint[];
  loading: boolean;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card title="Revenue">
        <Spin tip="Loading..." style={{ width: '100%', padding: 48 }} />
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card title="Revenue">
        <Empty description="No revenue data" />
      </Card>
    );
  }

  const config = {
    data,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    point: { size: 3 },
    tooltip: {
      formatter: (datum: RevenueDataPoint) => ({
        name: 'Revenue',
        value: `${datum.revenue.toLocaleString()} UZS`,
      }),
    },
    yAxis: {
      label: {
        formatter: (v: string) =>
          `${(Number(v) / 1000).toFixed(0)}k`,
      },
    },
  };

  return (
    <Card title="Revenue Over Time">
      <Line {...config} height={350} />
    </Card>
  );
};

export default RevenueChart;
