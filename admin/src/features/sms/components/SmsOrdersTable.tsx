import { Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import type { SmsOrder, SmsOrderStatus } from '../api/sms.api';

const STATUS_COLORS: Record<SmsOrderStatus, string> = {
  WAITING: 'orange',
  RECEIVED: 'green',
  CANCELED: 'red',
  TIMEOUT: 'default',
};

const STATUS_LABELS: Record<SmsOrderStatus, string> = {
  WAITING: 'Kutilmoqda',
  RECEIVED: 'Qabul qilindi',
  CANCELED: 'Bekor qilindi',
  TIMEOUT: 'Vaqt tugadi',
};

interface SmsOrdersTableProps {
  data: SmsOrder[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onTableChange: (
    pagination: TablePaginationConfig,
    sorter: SorterResult<SmsOrder> | SorterResult<SmsOrder>[],
  ) => void;
}

export const SmsOrdersTable: React.FC<SmsOrdersTableProps> = ({
  data,
  loading,
  pagination,
  onTableChange,
}) => {
  const columns: ColumnsType<SmsOrder> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string) => id.slice(0, 8),
    },
    {
      title: 'Foydalanuvchi',
      dataIndex: 'user',
      key: 'user',
      render: (_: unknown, record: SmsOrder) => {
        const user = record.user;
        if (!user) return '-';
        return user.username ?? user.firstName ?? user.telegramId;
      },
    },
    {
      title: 'Xizmat',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Davlat',
      dataIndex: 'country',
      key: 'country',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null) => phone ?? '-',
    },
    {
      title: 'SMS Kod',
      dataIndex: 'smsCode',
      key: 'smsCode',
      render: (code: string | null) => code ?? '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: SmsOrderStatus) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: 'Narx',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      render: (price: number) => `${price.toLocaleString()} so'm`,
    },
    {
      title: 'Yaratilgan',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
  ];

  return (
    <Table<SmsOrder>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `Jami: ${total}`,
      }}
      onChange={(pag, _filters, sorter) => onTableChange(pag, sorter)}
      scroll={{ x: 1000 }}
    />
  );
};
