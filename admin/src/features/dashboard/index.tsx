import { Col, Row } from 'antd';
import { PageHeader } from '@/shared/components/PageHeader';
import { StatsCards } from '@/features/dashboard/components/StatsCards';
import { RevenueChart } from '@/features/dashboard/components/RevenueChart';
import { RecentOrders } from '@/features/dashboard/components/RecentOrders';

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Umumiy ko'rsatkichlar va so'nggi faoliyat"
      />
      <Row gutter={[16, 24]}>
        <Col span={24}>
          <StatsCards />
        </Col>
        <Col span={24}>
          <RevenueChart />
        </Col>
        <Col span={24}>
          <RecentOrders />
        </Col>
      </Row>
    </>
  );
}
