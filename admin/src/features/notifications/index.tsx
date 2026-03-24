import { useState, useCallback } from 'react';
import { Typography, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import NotificationsTable from './components/NotificationsTable';
import BroadcastModal from './components/BroadcastModal';
import {
  useNotifications,
  useCreateNotification,
} from './hooks/useNotifications';
import type { CreateNotificationDto } from './api/notifications.api';

const PageWrapper = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useNotifications({ page, limit });
  const createMutation = useCreateNotification();

  const handlePageChange = useCallback((p: number, l: number) => {
    setPage(p);
    setLimit(l);
  }, []);

  const handleSubmit = useCallback(
    (values: CreateNotificationDto) => {
      createMutation.mutate(values, {
        onSuccess: () => setModalOpen(false),
      });
    },
    [createMutation],
  );

  return (
    <PageWrapper>
      <Header>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Notifications
        </Typography.Title>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => setModalOpen(true)}
        >
          Send Broadcast
        </Button>
      </Header>

      <NotificationsTable
        data={data?.data ?? []}
        loading={isLoading}
        total={data?.meta?.total ?? 0}
        page={page}
        limit={limit}
        onPageChange={handlePageChange}
      />

      <BroadcastModal
        open={modalOpen}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
        loading={createMutation.isPending}
      />
    </PageWrapper>
  );
};

export { NotificationsPage };
export default NotificationsPage;
