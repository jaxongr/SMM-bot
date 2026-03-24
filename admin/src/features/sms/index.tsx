import { useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import {
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type { TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { SmsOrdersTable } from './components/SmsOrdersTable';
import { useSmsOrders, useSmsStats } from './hooks/useSms';
import type { SmsOrder, SmsOrderFiltersParams } from './api/sms.api';

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

const SmsPage: React.FC = () => {
  const [filters, setFilters] = useState<SmsOrderFiltersParams>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useSmsOrders(filters);
  const { data: statsData, isLoading: statsLoading } = useSmsStats();

  const stats = statsData?.data;

  const handleTableChange = useCallback(
    (pagination: TablePaginationConfig, sorter: SorterResult<SmsOrder> | SorterResult<SmsOrder>[]) => {
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

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        SMS Aktivatsiya
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
                prefix={<PhoneOutlined />}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Qabul qilingan"
                value={stats.receivedOrders}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Bekor qilingan"
                value={stats.canceledOrders}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Kutilmoqda"
                value={stats.waitingOrders}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={8} lg={4}>
            <StatCard>
              <Statistic
                title="Jami sarflangan"
                value={stats.totalSpent}
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
                prefix={<CalendarOutlined />}
              />
            </StatCard>
          </Col>
        </StatsRow>
      ) : null}

      <Card>
        <SmsOrdersTable
          data={data?.data ?? []}
          loading={isLoading}
          pagination={{
            current: filters.page ?? 1,
            pageSize: filters.limit ?? 20,
            total: data?.meta?.total ?? 0,
          }}
          onTableChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export { SmsPage };
export default SmsPage;
