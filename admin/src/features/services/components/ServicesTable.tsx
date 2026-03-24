import { Table, Tag, Button, Space, Tooltip, Switch, Select } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import styled from 'styled-components';
import type { Service, Category } from '../api/services.api';
import type { Platform } from '@/shared/types';

interface ServicesTableProps {
  data: Service[];
  loading: boolean;
  categories: Category[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onTableChange: (pagination: TablePaginationConfig) => void;
  onEdit: (service: Service) => void;
  onCreate: () => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  categoryFilter: string | undefined;
  onCategoryFilterChange: (value: string | undefined) => void;
  platformFilter: Platform | undefined;
  onPlatformFilterChange: (value: Platform | undefined) => void;
}

const PLATFORM_COLOR_MAP: Record<Platform, string> = {
  TELEGRAM: 'blue',
  INSTAGRAM: 'magenta',
  YOUTUBE: 'red',
  TIKTOK: 'purple',
};

const FiltersRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ServicesTable: React.FC<ServicesTableProps> = ({
  data,
  loading,
  categories,
  pagination,
  onTableChange,
  onEdit,
  onCreate,
  onToggleActive,
  categoryFilter,
  onCategoryFilterChange,
  platformFilter,
  onPlatformFilterChange,
}) => {
  const columns: ColumnsType<Service> = [
    {
      title: 'Nomi (UZ)',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (_: unknown, record: Service) => record.name.uz ?? record.name.en ?? '--',
    },
    {
      title: 'Kategoriya',
      key: 'category',
      width: 150,
      render: (_: unknown, record: Service) =>
        record.category?.name?.uz ?? record.category?.name?.en ?? '--',
    },
    {
      title: 'Platforma',
      key: 'platform',
      width: 120,
      render: (_: unknown, record: Service) => {
        const platform = record.category?.platform;
        return platform ? (
          <Tag color={PLATFORM_COLOR_MAP[platform]}>{platform}</Tag>
        ) : '--';
      },
    },
    {
      title: 'Min / Max',
      key: 'quantity',
      width: 130,
      render: (_: unknown, record: Service) =>
        `${record.minQuantity.toLocaleString()} / ${record.maxQuantity.toLocaleString()}`,
    },
    {
      title: 'Narx (1000 ta)',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      width: 130,
      render: (price: number) => `${price.toLocaleString()} so'm`,
    },
    {
      title: 'Avto',
      dataIndex: 'isAutoService',
      key: 'isAutoService',
      width: 70,
      render: (val: boolean) =>
        val ? <Tag color="green">Ha</Tag> : <Tag>Yo'q</Tag>,
    },
    {
      title: 'Drip',
      dataIndex: 'isDripFeed',
      key: 'isDripFeed',
      width: 70,
      render: (val: boolean) =>
        val ? <Tag color="green">Ha</Tag> : <Tag>Yo'q</Tag>,
    },
    {
      title: 'Holat',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean, record: Service) => (
        <Switch
          checked={isActive}
          size="small"
          onChange={(checked) => onToggleActive(record.id, checked)}
        />
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_: unknown, record: Service) => (
        <Tooltip title="Tahrirlash">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <FiltersRow>
        <FilterGroup>
          <Select
            placeholder="Kategoriya"
            value={categoryFilter}
            onChange={onCategoryFilterChange}
            allowClear
            style={{ width: 200 }}
            options={[
              ...categories.map((cat) => ({
                label: cat.name.uz ?? cat.name.en ?? cat.slug,
                value: cat.id,
              })),
            ]}
          />
          <Select
            placeholder="Platforma"
            value={platformFilter}
            onChange={onPlatformFilterChange}
            allowClear
            style={{ width: 160 }}
            options={[
              { label: 'Telegram', value: 'TELEGRAM' },
              { label: 'Instagram', value: 'INSTAGRAM' },
              { label: 'YouTube', value: 'YOUTUBE' },
              { label: 'TikTok', value: 'TIKTOK' },
            ]}
          />
        </FilterGroup>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Yangi xizmat
        </Button>
      </FiltersRow>

      <Table<Service>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Jami: ${total}`,
          pageSizeOptions: ['10', '20', '50'],
        }}
        onChange={(pag) => onTableChange(pag)}
      />
    </div>
  );
};
