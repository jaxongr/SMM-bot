import { useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, Button } from 'antd';
import {
  GiftOutlined,
  CheckCircleOutlined,
  UsergroupAddOutlined,
  DollarOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type { TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { PromoTable } from './components/PromoTable';
import { CreatePromoModal } from './components/CreatePromoModal';
import { usePromos, usePromoStats } from './hooks/usePromo';
import type { Promo, PromoFiltersParams } from './api/promo.api';

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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PromoPage: React.FC = () => {
  const [filters, setFilters] = useState<PromoFiltersParams>({
    page: 1,
    limit: 20,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = usePromos(filters);
  const { data: statsData, isLoading: statsLoading } = usePromoStats();

  const stats = statsData?.data;

  const handleTableChange = useCallback(
    (pagination: TablePaginationConfig, sorter: SorterResult<Promo> | SorterResult<Promo>[]) => {
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
      <HeaderRow>
        <Title level={3} style={{ margin: 0 }}>
          Promo kodlar
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Yangi promo kod
        </Button>
      </HeaderRow>

      {statsLoading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : stats ? (
        <StatsRow gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <StatCard>
              <Statistic
                title="Jami promo kodlar"
                value={stats.totalPromos}
                prefix={<GiftOutlined />}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatCard>
              <Statistic
                title="Faol promo kodlar"
                value={stats.activePromos}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatCard>
              <Statistic
                title="Jami ishlatilgan"
                value={stats.totalUsages}
                prefix={<UsergroupAddOutlined />}
              />
            </StatCard>
          </Col>
          <Col xs={12} sm={6}>
            <StatCard>
              <Statistic
                title="Jami bonus berilgan"
                value={stats.totalBonusGiven}
                prefix={<DollarOutlined />}
                suffix="so'm"
                valueStyle={{ color: '#1677ff' }}
              />
            </StatCard>
          </Col>
        </StatsRow>
      ) : null}

      <Card>
        <PromoTable
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

      <CreatePromoModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export { PromoPage };
export default PromoPage;
