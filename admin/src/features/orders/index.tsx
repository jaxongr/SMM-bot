import { useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type { TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { Dayjs } from 'dayjs';
import { OrderFilters } from './components/OrderFilters';
import { OrdersTable } from './components/OrdersTable';
import { OrderDetailDrawer } from './components/OrderDetailDrawer';
import { useOrders, useOrderStats } from './hooks/useOrders';
import type { Order, OrderFiltersParams } from './api/orders.api';
import type { OrderStatus, Platform } from '@/shared/types';

const { Title } = Typography;

const StatsRow = styled(Row)`
  margin-bottom: 20px;
`;

const StatCard = styled(Card)`
  .ant-statistic-title {
    font-size: 13px;
    color: #666;
  }
`;

const OrdersPage: React.FC = () => {
  const [filters, setFilters] = useState<OrderFiltersParams>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);
  const [platformFilter, setPlatformFilter] = useState<Platform | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const queryParams: OrderFiltersParams = {
    ...filters,
    search: search || undefined,
    status: statusFilter.length > 0 ? statusFilter : undefined,
    platform: platformFilter,
    dateFrom: dateRange?.[0]?.toISOString(),
    dateTo: dateRange?.[1]?.toISOString(),
  };

  const { data, isLoading } = useOrders(queryParams);
  const { data: statsData, isLoading: statsLoading } = useOrderStats();

  const stats = statsData?.data;

  const handleTableChange = useCallback(
    (pagination: TablePaginationConfig, sorter: SorterResult<Order> | SorterResult<Order>[]) => {
      const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
      setFilters((prev) => ({
        ...prev,
        page: pagination.current ?? 1,
        limit: pagination.pageSize ?? 20,
        sortBy: singleSorter?.field as string | undefined,
        sortOrder: singleSorter?.order === 'ascend' ? 'asc' : singleSorter?.order === 'descend' ? 'desc' : undefined,
      }));
    },
    [],
  );

  const handleView = useCallback((order: Order) => {
    setSelectedOrderId(order.id);
    setDrawerOpen(true);
  }, []);

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        Buyurtmalar
      </Title>

      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : stats ? (
        <StatsRow gutter={[16, 16]}>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Jami buyurtmalar"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined />}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Kutilmoqda"
                value={stats.pendingOrders}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Bajarildi"
                value={stats.completedOrders}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Jami daromad"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                suffix="so'm"
                valueStyle={{ color: '#1677ff' }}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Bugungi buyurtmalar"
                value={stats.todayOrders}
                prefix={<ShoppingCartOutlined />}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Bugungi daromad"
                value={stats.todayRevenue}
                suffix="so'm"
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </StatCard>
          </Col>
        </StatsRow>
      ) : null}

      <Card>
        <OrderFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          platformFilter={platformFilter}
          onPlatformChange={setPlatformFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <OrdersTable
          data={data?.data ?? []}
          loading={isLoading}
          pagination={{
            current: filters.page ?? 1,
            pageSize: filters.limit ?? 20,
            total: data?.meta?.total ?? 0,
          }}
          onTableChange={handleTableChange}
          onView={handleView}
        />
      </Card>

      <OrderDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export { OrdersPage };
export default OrdersPage;
