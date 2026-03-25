import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const TARGET_COLORS: Record<string, string> = {
  ALL: 'blue',
  USER: 'green',
  ROLE: 'orange',
};

const TARGET_LABELS: Record<string, string> = {
  ALL: 'Hammaga',
  USER: 'Foydalanuvchi',
  ROLE: 'Rol',
};

interface NotificationRow {
  id: string;
  title: Record<string, string> | string;
  message: Record<string, string> | string;
  targetType: string;
  targetId?: string;
  _count?: { recipients: number };
  createdAt: string;
}

interface NotificationsTableProps {
  data: NotificationRow[];
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
  const columns: ColumnsType<NotificationRow> = [
    {
      title: 'Sarlavha (UZ)',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: Record<string, string> | string) => {
        if (typeof title === 'string') return title;
        return title?.uz || title?.ru || title?.en || '-';
      },
    },
    {
      title: 'Nishon',
      dataIndex: 'targetType',
      key: 'targetType',
      render: (target: string, record: NotificationRow) => (
        <>
          <Tag color={TARGET_COLORS[target] || 'default'}>
            {TARGET_LABELS[target] || target}
          </Tag>
          {record.targetId && (
            <span style={{ fontSize: 12, color: '#999' }}>
              ({record.targetId})
            </span>
          )}
        </>
      ),
    },
    {
      title: 'Qabul qiluvchilar',
      key: 'recipients',
      width: 120,
      render: (_: unknown, record: NotificationRow) => {
        const count = record._count?.recipients;
        return count !== undefined && count !== null ? Number(count).toLocaleString() : '0';
      },
    },
    {
      title: 'Yaratilgan joyi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-',
    },
  ];

  return (
    <Table<NotificationRow>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: true,
        showTotal: (t) => `Jami: ${t}`,
        onChange: onPageChange,
      }}
    />
  );
};

export default NotificationsTable;
