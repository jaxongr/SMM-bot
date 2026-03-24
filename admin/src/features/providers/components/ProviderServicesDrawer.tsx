import { Drawer, Table, Tag, Empty, Spin } from 'antd';
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

  const columns: ColumnsType<ProviderService> = [
    {
      title: 'Ext. ID',
      dataIndex: 'externalId',
      key: 'externalId',
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => <Tag>{cat}</Tag>,
    },
    {
      title: 'Rate',
      dataIndex: 'rate',
      key: 'rate',
      render: (rate: number) => `$${rate.toFixed(4)}`,
    },
    {
      title: 'Min',
      dataIndex: 'minOrder',
      key: 'minOrder',
    },
    {
      title: 'Max',
      dataIndex: 'maxOrder',
      key: 'maxOrder',
      render: (val: number) => val.toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
  ];

  return (
    <Drawer
      title={`Services — ${provider?.name ?? ''}`}
      open={open}
      onClose={onClose}
      width={800}
      destroyOnClose
    >
      {isLoading ? (
        <Spin tip="Loading services..." style={{ width: '100%', marginTop: 48 }} />
      ) : data?.data?.length ? (
        <Table<ProviderService>
          columns={columns}
          dataSource={data.data}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 50 }}
        />
      ) : (
        <Empty description="No services found. Try syncing first." />
      )}
    </Drawer>
  );
};

export default ProviderServicesDrawer;
