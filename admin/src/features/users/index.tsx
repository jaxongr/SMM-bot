import { useState, useCallback } from 'react';
import { Card, Typography } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { Dayjs } from 'dayjs';
import { UserFilters } from './components/UserFilters';
import { UsersTable } from './components/UsersTable';
import { UserDetailDrawer } from './components/UserDetailDrawer';
import { AdjustBalanceModal } from './components/AdjustBalanceModal';
import { useUsers, useToggleBlock } from './hooks/useUsers';
import type { User, UserRole, UserFiltersParams } from './api/users.api';

const { Title } = Typography;

const UsersPage: React.FC = () => {
  const [filters, setFilters] = useState<UserFiltersParams>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<UserRole | undefined>();
  const [isBlocked, setIsBlocked] = useState<boolean | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [balanceUser, setBalanceUser] = useState<User | null>(null);

  const queryParams: UserFiltersParams = {
    ...filters,
    search: search || undefined,
    role,
    isBlocked,
    dateFrom: dateRange?.[0]?.toISOString(),
    dateTo: dateRange?.[1]?.toISOString(),
  };

  const { data, isLoading } = useUsers(queryParams);
  const toggleBlock = useToggleBlock();

  const handleTableChange = useCallback(
    (pagination: TablePaginationConfig, sorter: SorterResult<User> | SorterResult<User>[]) => {
      const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
      setFilters((prev) => ({
        ...prev,
        page: pagination.current ?? 1,
        limit: pagination.pageSize ?? 20,
        sortBy: singleSorter?.field as string | undefined,
        sortOrder: singleSorter?.order === 'ascend' ? 'asc' : singleSorter?.order === 'descend' ? 'desc' : undefined,
      }));
    },
    [],
  );

  const handleView = useCallback((user: User) => {
    setSelectedUserId(user.id);
    setDrawerOpen(true);
  }, []);

  const handleToggleBlock = useCallback(
    (userId: string) => {
      toggleBlock.mutate(userId);
    },
    [toggleBlock],
  );

  const handleAdjustBalance = useCallback((user: User) => {
    setBalanceUser(user);
    setBalanceModalOpen(true);
  }, []);

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        Foydalanuvchilar
      </Title>

      <Card>
        <UserFilters
          search={search}
          onSearchChange={setSearch}
          role={role}
          onRoleChange={setRole}
          isBlocked={isBlocked}
          onBlockedChange={setIsBlocked}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <UsersTable
          data={data?.data ?? []}
          loading={isLoading}
          pagination={{
            current: filters.page ?? 1,
            pageSize: filters.limit ?? 20,
            total: data?.meta?.total ?? 0,
          }}
          onTableChange={handleTableChange}
          onView={handleView}
          onToggleBlock={handleToggleBlock}
          onAdjustBalance={handleAdjustBalance}
          blockLoading={toggleBlock.isPending}
        />
      </Card>

      <UserDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userId={selectedUserId}
      />

      <AdjustBalanceModal
        open={balanceModalOpen}
        onClose={() => {
          setBalanceModalOpen(false);
          setBalanceUser(null);
        }}
        userId={balanceUser?.id ?? null}
        currentBalance={balanceUser?.balance ?? 0}
        userName={
          balanceUser
            ? [balanceUser.firstName, balanceUser.lastName].filter(Boolean).join(' ') ||
              balanceUser.username ||
              balanceUser.telegramId
            : ''
        }
      />
    </div>
  );
};

export { UsersPage };
export default UsersPage;
