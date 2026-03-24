import { Card, Row, Col, Spin, Empty } from 'antd';
import { Pie, Column } from '@ant-design/charts';
import type { OrdersStatsData } from '../../../shared/types';

interface OrdersChartProps {
  data: OrdersStatsData | null;
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#faad14',
  PROCESSING: '#1890ff',
  IN_PROGRESS: '#722ed1',
  COMPLETED: '#52c41a',
  PARTIAL: '#eb2f96',
  CANCELED: '#8c8c8c',
  FAILED: '#ff4d4f',
};

const OrdersChart: React.FC<OrdersChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card title="Orders">
        <Spin tip="Loading..." style={{ width: '100%', padding: 48 }} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card title="Orders">
        <Empty description="No orders data" />
      </Card>
    );
  }

  const pieConfig = {
    data: data.byStatus,
    angleField: 'count',
    colorField: 'status',
    color: data.byStatus.map((item) => STATUS_COLORS[item.status] ?? '#8c8c8c'),
    label: {
      text: 'count',
      position: 'outside' as const,
    },
    legend: { position: 'bottom' as const },
  };

  const barConfig = {
    data: data.byPlatform,
    xField: 'platform',
    yField: 'count',
    color: '#1890ff',
    label: { position: 'top' as const },
  };

  return (
    <Row gutter={16}>
      <Col span={12}>
        <Card title="Orders by Status">
          <Pie {...pieConfig} height={300} />
        </Card>
      </Col>
      <Col span={12}>
        <Card title="Orders by Platform">
          <Column {...barConfig} height={300} />
        </Card>
      </Col>
    </Row>
  );
};

export default OrdersChart;
