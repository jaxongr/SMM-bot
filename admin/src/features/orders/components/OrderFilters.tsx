import { Input, Select, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import type { OrderStatus, Platform } from '@/shared/types';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderStatus[];
  onStatusChange: (value: OrderStatus[]) => void;
  platformFilter: Platform | undefined;
  onPlatformChange: (value: Platform | undefined) => void;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  onDateRangeChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
}

const FiltersWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const STATUS_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: 'Kutilmoqda', value: 'PENDING' },
  { label: 'Qayta ishlanmoqda', value: 'PROCESSING' },
  { label: 'Jarayonda', value: 'IN_PROGRESS' },
  { label: 'Bajarildi', value: 'COMPLETED' },
  { label: 'Qisman', value: 'PARTIAL' },
  { label: 'Bekor qilingan', value: 'CANCELED' },
  { label: 'Xato', value: 'FAILED' },
];

const PLATFORM_OPTIONS: { label: string; value: Platform }[] = [
  { label: 'Telegram', value: 'TELEGRAM' },
  { label: 'Instagram', value: 'INSTAGRAM' },
  { label: 'YouTube', value: 'YOUTUBE' },
  { label: 'TikTok', value: 'TIKTOK' },
];

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  platformFilter,
  onPlatformChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <FiltersWrapper>
      <Input
        placeholder="Link bo'yicha qidirish..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 280 }}
        allowClear
      />
      <Select
        mode="multiple"
        placeholder="Status"
        value={statusFilter}
        onChange={onStatusChange}
        options={STATUS_OPTIONS}
        style={{ minWidth: 200 }}
        maxTagCount={2}
        allowClear
      />
      <Select
        placeholder="Platforma"
        value={platformFilter}
        onChange={onPlatformChange}
        options={PLATFORM_OPTIONS}
        style={{ width: 160 }}
        allowClear
      />
      <RangePicker
        value={dateRange}
        onChange={(dates) => onDateRangeChange(dates as [Dayjs | null, Dayjs | null] | null)}
        placeholder={['Boshlanish', 'Tugash']}
      />
    </FiltersWrapper>
  );
};
