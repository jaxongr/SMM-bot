import { Table, Tag, Button, Space, Tooltip, Popconfirm } from 'antd';
import {
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import type { User, UserRole } from '../api/users.api';

interface UsersTableProps {
  data: User[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onTableChange: (
    pagination: TablePaginationConfig,
    sorter: SorterResult<User> | SorterResult<User>[],
  ) => void;
  onView: (user: User) => void;
  onToggleBlock: (userId: string) => void;
  onAdjustBalance: (user: User) => void;
  blockLoading: boolean;
}

const ROLE_COLOR_MAP: Record<UserRole, string> = {
  ADMIN: 'red',
  MODERATOR: 'orange',
  USER: 'blue',
};

const ROLE_LABEL_MAP: Record<UserRole, string> = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  USER: 'Foydalanuvchi',
};

export const UsersTable: React.FC<UsersTableProps> = ({
  data,
  loading,
  pagination,
  onTableChange,
  onView,
  onToggleBlock,
  onAdjustBalance,
  blockLoading,
}) => {
  const columns: ColumnsType<User> = [
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
      title: 'Telegram ID',
      dataIndex: 'telegramId',
      key: 'telegramId',
      width: 130,
      sorter: true,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string | null) =>
        username ? (
          <a
            href={`https://t.me/${username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{username}
          </a>
        ) : (
          <span style={{ color: '#999' }}>--</span>
        ),
    },
    {
      title: 'Ism',
      key: 'name',
      width: 160,
      render: (_: unknown, record: User) =>
        [record.firstName, record.lastName].filter(Boolean).join(' ') || '--',
    },
    {
      title: 'Balans',
      dataIndex: 'balance',
      key: 'balance',
      width: 130,
      sorter: true,
      render: (balance: number) => (
        <span style={{ fontWeight: 600 }}>
          {balance.toLocaleString()} <small>so'm</small>
        </span>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: UserRole) => (
        <Tag color={ROLE_COLOR_MAP[role]}>{ROLE_LABEL_MAP[role]}</Tag>
      ),
    },
    {
      title: 'Holat',
      dataIndex: 'isBlocked',
      key: 'isBlocked',
      width: 110,
      render: (isBlocked: boolean) =>
        isBlocked ? (
          <Tag color="error">Bloklangan</Tag>
        ) : (
          <Tag color="success">Faol</Tag>
        ),
    },
    {
      title: "Ro'yxatdan o'tgan",
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Tooltip title="Ko'rish">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Balans">
            <Button
              type="text"
              icon={<WalletOutlined />}
              onClick={() => onAdjustBalance(record)}
            />
          </Tooltip>
          <Popconfirm
            title={
              record.isBlocked
                ? 'Foydalanuvchini blokdan chiqarish?'
                : 'Foydalanuvchini bloklash?'
            }
            onConfirm={() => onToggleBlock(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Tooltip title={record.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}>
              <Button
                type="text"
                danger={!record.isBlocked}
                loading={blockLoading}
                icon={record.isBlocked ? <UnlockOutlined /> : <LockOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table<User>
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `Jami: ${total}`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={(pag, _filters, sorter) =>
        onTableChange(pag, sorter as SorterResult<User> | SorterResult<User>[])
      }
    />
  );
};
