import { Card, Spin, Empty } from 'antd';
import { Area } from '@ant-design/charts';
import type { UserGrowthDataPoint } from '../../../shared/types';

interface UserGrowthChartProps {
  data: UserGrowthDataPoint[];
  loading: boolean;
}

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card title="User Growth">
        <Spin tip="Loading..." style={{ width: '100%', padding: 48 }} />
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card title="User Growth">
        <Empty description="No user growth data" />
      </Card>
    );
  }

  const chartData = data.flatMap((point) => [
    { date: point.date, value: point.newUsers, type: 'New Users' },
    { date: point.date, value: point.totalUsers, type: 'Total Users' },
  ]);

  const config = {
    data: chartData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    areaStyle: { fillOpacity: 0.15 },
    legend: { position: 'top' as const },
  };

  return (
    <Card title="User Growth Over Time">
      <Area {...config} height={350} />
    </Card>
  );
};

export default UserGrowthChart;
