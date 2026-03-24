import {
  Drawer,
  Descriptions,
  Tag,
  Tabs,
  Table,
  Spin,
  Empty,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useUserDetail, useUserReferrals } from '../hooks/useUsers';
import { useState } from 'react';
import type { UserRole } from '../api/users.api';

const { Text } = Typography;

interface UserDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

const ROLE_COLOR_MAP: Record<UserRole, string> = {
  ADMIN: 'red',
  MODERATOR: 'orange',
  USER: 'blue',
};

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  open,
  onClose,
  userId,
}) => {
  const { data: userData, isLoading } = useUserDetail(userId);
  const [referralPage, setReferralPage] = useState(1);
  const { data: referralsData, isLoading: referralsLoading } = useUserReferrals(
    userId,
    { page: referralPage, limit: 10 },
  );

  const user = userData?.data;

  const infoTab = user ? (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="ID">
        <Text copyable style={{ fontFamily: 'monospace' }}>
          {user.id}
        </Text>
      </Descriptions.Item>
      <Descriptions.Item label="Telegram ID">
        <Text copyable>{user.telegramId}</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Username">
        {user.username ? (
          <a
            href={`https://t.me/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            @{user.username}
          </a>
        ) : (
          '--'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Ism">{user.firstName ?? '--'}</Descriptions.Item>
      <Descriptions.Item label="Familiya">{user.lastName ?? '--'}</Descriptions.Item>
      <Descriptions.Item label="Balans">
        <Text strong>{user.balance.toLocaleString()} so'm</Text>
      </Descriptions.Item>
      <Descriptions.Item label="Rol">
        <Tag color={ROLE_COLOR_MAP[user.role]}>{user.role}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Holat">
        {user.isBlocked ? (
          <Tag color="error">Bloklangan</Tag>
        ) : (
          <Tag color="success">Faol</Tag>
        )}
      </Descriptions.Item>
      <Descriptions.Item label="Referral kodi">
        {user.referralCode ?? '--'}
      </Descriptions.Item>
      <Descriptions.Item label="Referral orqali">
        {user.referredBy ?? '--'}
      </Descriptions.Item>
      <Descriptions.Item label="Ro'yxatdan o'tgan">
        {dayjs(user.createdAt).format('DD.MM.YYYY HH:mm:ss')}
      </Descriptions.Item>
      <Descriptions.Item label="Yangilangan">
        {dayjs(user.updatedAt).format('DD.MM.YYYY HH:mm:ss')}
      </Descriptions.Item>
    </Descriptions>
  ) : null;

  const referralsTab = (
    <Table
      dataSource={referralsData?.data ?? []}
      loading={referralsLoading}
      rowKey="id"
      size="small"
      pagination={{
        current: referralPage,
        pageSize: 10,
        total: referralsData?.meta?.total ?? 0,
        onChange: (page) => setReferralPage(page),
        showTotal: (total) => `Jami: ${total}`,
      }}
      columns={[
        {
          title: 'Telegram ID',
          dataIndex: 'telegramId',
          key: 'telegramId',
        },
        {
          title: 'Username',
          dataIndex: 'username',
          key: 'username',
          render: (val: string | null) => val ? `@${val}` : '--',
        },
        {
          title: 'Ism',
          dataIndex: 'firstName',
          key: 'firstName',
          render: (val: string | null) => val ?? '--',
        },
        {
          title: 'Sana',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
        },
      ]}
      locale={{ emptyText: <Empty description="Referrallar topilmadi" /> }}
    />
  );

  const tabItems = [
    { key: 'info', label: "Ma'lumotlar", children: infoTab },
    { key: 'referrals', label: 'Referrallar', children: referralsTab },
  ];

  return (
    <Drawer
      title="Foydalanuvchi tafsilotlari"
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : user ? (
        <Tabs items={tabItems} />
      ) : (
        <Empty description="Foydalanuvchi topilmadi" />
      )}
    </Drawer>
  );
};
