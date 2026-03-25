import { Table, Button, Space, Switch, Tooltip, Tag } from 'antd';
import {
  EditOutlined,
  SyncOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Provider } from '../../../shared/types';

interface ProvidersTableProps {
  data: Provider[];
  loading: boolean;
  onEdit: (provider: Provider) => void;
  onSync: (id: string) => void;
  onViewServices: (provider: Provider) => void;
  onToggleActive: (id: string, active: boolean) => void;
  syncing: boolean;
}

const ProvidersTable: React.FC<ProvidersTableProps> = ({
  data,
  loading,
  onEdit,
  onSync,
  onViewServices,
  onToggleActive,
  syncing,
}) => {
  const columns: ColumnsType<Provider> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'API URL',
      dataIndex: 'apiUrl',
      key: 'apiUrl',
      render: (url: string) => (
        <Tooltip title={url}>
          {url.length > 30 ? `${url.slice(0, 30)}...` : url}
        </Tooltip>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: string | number | null) =>
        balance !== null && balance !== undefined ? `$${Number(balance).toFixed(2)}` : '-',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean, record: Provider) => (
        <Switch
          checked={active}
          onChange={(checked) => onToggleActive(record.id, checked)}
        />
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => a.priority - b.priority,
      render: (priority: number) => <Tag>{priority}</Tag>,
    },
    {
      title: 'Last Sync',
      dataIndex: 'lastSyncAt',
      key: 'lastSyncAt',
      render: (date: string | null) =>
        date ? dayjs(date).format('DD.MM.YYYY HH:mm') : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Provider) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Sync Services">
            <Button
              size="small"
              icon={<SyncOutlined />}
              loading={syncing}
              onClick={() => onSync(record.id)}
            />
          </Tooltip>
          <Tooltip title="View Services">
            <Button
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => onViewServices(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table<Provider>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={false}
    />
  );
};

export default ProvidersTable;
