import { Drawer, Table, Tag, Empty, Spin, Input } from 'antd';
import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { Provider, ProviderService } from '../../../shared/types';
import { useProviderServices } from '../hooks/useProviders';

interface ProviderServicesDrawerProps {
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
  onMapService?: (service: ProviderService) => void;
}

const ProviderServicesDrawer: React.FC<ProviderServicesDrawerProps> = ({
  provider,
  open,
  onClose,
}) => {
  const { data, isLoading } = useProviderServices(provider?.id ?? '');
  const [search, setSearch] = useState('');

  const filtered = data?.data?.filter((s: ProviderService) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(search.toLowerCase())) ||
    s.externalServiceId?.toString().includes(search)
  ) ?? [];

  const columns: ColumnsType<ProviderService> = [
    {
      title: 'ID',
      dataIndex: 'externalServiceId',
      key: 'externalServiceId',
      width: 70,
      fixed: 'left',
    },
    {
      title: 'Nomi',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      ellipsis: true,
    },
    {
      title: 'Kategoriya',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      ellipsis: true,
      render: (cat: string | null) => cat ? <Tag color="blue">{cat}</Tag> : '-',
    },
    {
      title: 'Narx ($)',
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      width: 100,
      align: 'right',
      render: (rate: string | number | null) =>
        rate !== null && rate !== undefined ? `$${Number(rate).toFixed(4)}` : '-',
      sorter: (a, b) => Number(a.pricePerUnit) - Number(b.pricePerUnit),
    },
    {
      title: 'Min',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      width: 80,
      align: 'right',
      render: (val: number | null) =>
        val !== null && val !== undefined ? Number(val).toLocaleString() : '-',
    },
    {
      title: 'Max',
      dataIndex: 'maxQuantity',
      key: 'maxQuantity',
      width: 100,
      align: 'right',
      render: (val: number | null) =>
        val !== null && val !== undefined ? Number(val).toLocaleString() : '-',
    },
  ];

  return (
    <Drawer
      title={`Xizmatlar — ${provider?.name ?? ''} (${filtered.length} ta)`}
      open={open}
      onClose={onClose}
      width={1000}
      destroyOnClose
    >
      <Input.Search
        placeholder="Xizmat nomi yoki kategoriya bo'yicha qidirish..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ marginBottom: 16 }}
      />
      {isLoading ? (
        <Spin tip="Yuklanmoqda..." style={{ width: '100%', marginTop: 48 }} />
      ) : filtered.length ? (
        <Table<ProviderService>
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="small"
          scroll={{ x: 800 }}
          pagination={{ pageSize: 50, showTotal: (total) => `Jami: ${total}` }}
        />
      ) : (
        <Empty description="Xizmat topilmadi. Avval Sync qiling." />
      )}
    </Drawer>
  );
};

export default ProviderServicesDrawer;
