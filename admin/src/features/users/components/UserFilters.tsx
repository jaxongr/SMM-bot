import { Input, Select, DatePicker, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { UserRole } from '../api/users.api';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRole | undefined;
  onRoleChange: (value: UserRole | undefined) => void;
  isBlocked: boolean | undefined;
  onBlockedChange: (value: boolean | undefined) => void;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
}

const FiltersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const ROLE_OPTIONS = [
  { label: 'Barchasi', value: '' },
  { label: 'Foydalanuvchi', value: 'USER' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Moderator', value: 'MODERATOR' },
];

const BLOCKED_OPTIONS = [
  { label: 'Barchasi', value: '' },
  { label: 'Faol', value: 'false' },
  { label: 'Bloklangan', value: 'true' },
];

export const UserFilters: React.FC<UserFiltersProps> = ({
  search,
  onSearchChange,
  role,
  onRoleChange,
  isBlocked,
  onBlockedChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <FiltersWrapper>
      <Input
        placeholder="Qidirish (username, telegram ID)..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 280 }}
        allowClear
      />
      <Select
        placeholder="Rol"
        value={role ?? ''}
        onChange={(val: string) => onRoleChange(val ? (val as UserRole) : undefined)}
        options={ROLE_OPTIONS}
        style={{ width: 160 }}
      />
      <Select
        placeholder="Holat"
        value={isBlocked === undefined ? '' : String(isBlocked)}
        onChange={(val: string) => onBlockedChange(val === '' ? undefined : val === 'true')}
        options={BLOCKED_OPTIONS}
        style={{ width: 160 }}
      />
      <RangePicker
        value={dateRange}
        onChange={(dates) => onDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
        placeholder={['Boshlanish', 'Tugash']}
      />
    </FiltersWrapper>
  );
};
