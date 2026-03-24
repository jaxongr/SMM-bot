import { Card, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useRecentOrders } from '@/features/dashboard/hooks/useDashboardStats';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatPrice, formatDate } from '@/shared/utils/format';
import type { Order } from '@/shared/types/api.types';

const { Link } = Typography;

export function RecentOrders() {
  const { data, isLoading } = useRecentOrders();
  const navigate = useNavigate();

  const columns: ColumnsType<Order> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => (
        <Link onClick={() => navigate(`/orders`)}>{id.slice(0, 8)}...</Link>
      ),
    },
    {
      title: 'Foydalanuvchi',
      key: 'user',
      render: (_: unknown, record: Order) =>
        record.user?.username || record.user?.firstName || record.userId.slice(0, 8),
    },
    {
      title: 'Xizmat',
      key: 'service',
      ellipsis: true,
      render: (_: unknown, record: Order) =>
        record.service?.name?.uz || record.serviceId.slice(0, 8),
    },
    {
      title: 'Miqdor',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
    },
    {
      title: 'Narx',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 150,
      align: 'right',
      render: (price: string) => formatPrice(Number(price)),
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => <StatusBadge status={status} type="order" />,
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <Card
      title="So'nggi buyurtmalar"
      extra={<Link onClick={() => navigate('/orders')}>Barchasini ko'rish</Link>}
      style={{ borderRadius: 12 }}
    >
      <Table<Order>
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
      />
    </Card>
  );
}
