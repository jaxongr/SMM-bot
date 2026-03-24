import { Col, Row } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { StatCard } from '@/shared/components/StatCard';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { formatNumber, formatPrice } from '@/shared/utils/format';

export function StatsCards() {
  const { data, isLoading } = useDashboardStats();

  const stats = data?.data;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          icon={<UserOutlined />}
          title="Jami foydalanuvchilar"
          value={stats ? formatNumber(stats.totalUsers) : '-'}
          change={stats?.usersChange}
          loading={isLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          icon={<ShoppingCartOutlined />}
          title="Bugungi buyurtmalar"
          value={stats ? formatNumber(stats.todayOrders) : '-'}
          change={stats?.ordersChange}
          loading={isLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          icon={<DollarOutlined />}
          title="Umumiy daromad"
          value={stats ? formatPrice(Number(stats.totalRevenue)) : '-'}
          change={stats?.revenueChange}
          loading={isLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          icon={<ThunderboltOutlined />}
          title="Faol buyurtmalar"
          value={stats ? formatNumber(stats.activeOrders) : '-'}
          change={stats?.activeOrdersChange}
          loading={isLoading}
        />
      </Col>
    </Row>
  );
}
