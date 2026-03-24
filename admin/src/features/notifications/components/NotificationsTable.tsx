import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Notification, NotificationTarget } from '../../../shared/types';

const TARGET_COLORS: Record<NotificationTarget, string> = {
  ALL: 'blue',
  USER: 'green',
  ROLE: 'orange',
};

interface NotificationsTableProps {
  data: Notification[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number, limit: number) => void;
}

const NotificationsTable: React.FC<NotificationsTableProps> = ({
  data,
  loading,
  total,
  page,
  limit,
  onPageChange,
}) => {
  const columns: ColumnsType<Notification> = [
    {
      title: 'Title (UZ)',
      dataIndex: 'titleUz',
      key: 'titleUz',
      ellipsis: true,
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      render: (target: NotificationTarget, record: Notification) => (
        <>
          <Tag color={TARGET_COLORS[target]}>{target}</Tag>
          {record.targetId && (
            <span style={{ fontSize: 12, color: '#999' }}>
              ({record.targetId})
            </span>
          )}
        </>
      ),
    },
    {
      title: 'Recipients',
      dataIndex: 'recipientsCount',
      key: 'recipientsCount',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
  ];

  return (
    <Table<Notification>
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

export default NotificationsTable;
