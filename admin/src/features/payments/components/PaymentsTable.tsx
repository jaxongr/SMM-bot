import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Payment, PaymentMethod, PaymentStatus } from '../../../shared/types';

const METHOD_COLORS: Record<PaymentMethod, string> = {
  CLICK: 'blue',
  PAYME: 'green',
  CRYPTO: 'orange',
};

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'gold',
  COMPLETED: 'green',
  FAILED: 'red',
  CANCELED: 'default',
};

interface PaymentsTableProps {
  data: Payment[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number, limit: number) => void;
  onApprove: (id: string) => void;
  approving: boolean;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  data,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onApprove,
  approving,
}) => {
  const columns: ColumnsType<Payment> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string) => (
        <Tooltip title={id}>
          {id.slice(0, 8)}...
        </Tooltip>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (_: unknown, record: Payment) =>
        record.user?.username || record.userId,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: true,
      render: (amount: number) =>
        new Intl.NumberFormat('uz-UZ', {
          style: 'currency',
          currency: 'UZS',
          maximumFractionDigits: 0,
        }).format(amount),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: PaymentMethod) => (
        <Tag color={METHOD_COLORS[method]}>{method}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: PaymentStatus) => (
        <Tag color={STATUS_COLORS[status]}>{status}</Tag>
      ),
    },
    {
      title: 'External ID',
      dataIndex: 'externalId',
      key: 'externalId',
      render: (val: string | null) => val || '-',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Payment) => (
        <Space>
          {record.status === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={approving}
              onClick={() => onApprove(record.id)}
            >
              Approve
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<Payment>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: true,
        showTotal: (t) => `Total: ${t}`,
        onChange: onPageChange,
      }}
    />
  );
};

export default PaymentsTable;
