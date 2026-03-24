import { Table, Button, Space, Tooltip } from 'antd';
import { EyeOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { OrderStatusTag } from './OrderStatusTag';
import type { Order } from '../api/orders.api';
import type { OrderStatus } from '@/shared/types';

interface OrdersTableProps {
  data: Order[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onTableChange: (
    pagination: TablePaginationConfig,
    sorter: SorterResult<Order> | SorterResult<Order>[],
  ) => void;
  onView: (order: Order) => void;
}

const MAX_LINK_LENGTH = 40;

export const OrdersTable: React.FC<OrdersTableProps> = ({
  data,
  loading,
  pagination,
  onTableChange,
  onView,
}) => {
  const columns: ColumnsType<Order> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string) => (
        <Tooltip title={id}>
          <span style={{ fontFamily: 'monospace' }}>{id.slice(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: 'Foydalanuvchi',
      key: 'user',
      width: 150,
      render: (_: unknown, record: Order) => {
        const user = record.user;
        if (!user) return '--';
        return user.username ? `@${user.username}` : user.telegramId;
      },
    },
    {
      title: 'Xizmat',
      key: 'service',
      width: 180,
      ellipsis: true,
      render: (_: unknown, record: Order) =>
        record.service?.name?.uz ?? record.service?.name?.en ?? '--',
    },
    {
      title: 'Link',
      dataIndex: 'link',
      key: 'link',
      width: 200,
      render: (link: string) => (
        <Tooltip title={link}>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <LinkOutlined />{' '}
            {link.length > MAX_LINK_LENGTH
              ? `${link.slice(0, MAX_LINK_LENGTH)}...`
              : link}
          </a>
        </Tooltip>
      ),
    },
    {
      title: 'Miqdor',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      sorter: true,
      render: (qty: number) => qty.toLocaleString(),
    },
    {
      title: 'Narx',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      sorter: true,
      render: (price: number) => (
        <span style={{ fontWeight: 600 }}>
          {price.toLocaleString()} <small>so'm</small>
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: OrderStatus) => <OrderStatusTag status={status} />,
    },
    {
      title: 'Provider',
      dataIndex: 'providerName',
      key: 'providerName',
      width: 120,
      render: (name: string | null) => name ?? '--',
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 70,
      fixed: 'right',
      render: (_: unknown, record: Order) => (
        <Space size="small">
          <Tooltip title="Ko'rish">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table<Order>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1400 }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `Jami: ${total}`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={(pag, _filters, sorter) =>
        onTableChange(pag, sorter as SorterResult<Order> | SorterResult<Order>[])
      }
    />
  );
};
