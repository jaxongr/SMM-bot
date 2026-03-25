import { Col, Row } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { StatCard } from '@/shared/components/StatCard';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { formatNumber, formatPrice } from '@/shared/utils/format';

export function StatsCards() {
  const { data, isLoading } = useDashboardStats();

  const stats = data?.data;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={4}>
        <StatCard
          icon={<UserOutlined />}
          title="Foydalanuvchilar"
          value={stats ? formatNumber(stats.totalUsers) : '-'}
          loading={isLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <StatCard
          icon={<ShoppingCartOutlined />}
          title="Bugungi buyurtmalar"
          value={stats ? formatNumber(stats.ordersToday || stats.todayOrders || 0) : '-'}
          loading={isLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <StatCard
          icon={<DollarOutlined />}
          title="Umumiy daromad"
          value={stats ? formatPrice(Number(stats.totalRevenue || 0)) : '-'}
          loading={isLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <StatCard
          icon={<ThunderboltOutlined />}
          title="Faol buyurtmalar"
          value={stats ? formatNumber(stats.activeOrders || 0) : '-'}
          loading={isLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <StatCard
          icon={<WalletOutlined />}
          title="Provayeder balans"
          value={stats?.totalProviderBalance !== undefined ? `$${Number(stats.totalProviderBalance).toFixed(2)}` : '-'}
          loading={isLoading}
        />
      </Col>
      <Col xs={24} sm={12} lg={4}>
        <StatCard
          icon={<DollarOutlined />}
          title="Bugungi daromad"
          value={stats ? formatPrice(Number(stats.revenueToday || 0)) : '-'}
          loading={isLoading}
        />
      </Col>
    </Row>
  );
}
