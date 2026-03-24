import { Table, Tag, Switch, Button, Popconfirm } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import type { Promo, PromoType } from '../api/promo.api';
import { useDeactivatePromo } from '../hooks/usePromo';

const TYPE_CONFIG: Record<PromoType, { color: string; label: string }> = {
  BALANCE_BONUS: { color: 'green', label: 'Balans bonus' },
  DISCOUNT_PERCENT: { color: 'blue', label: 'Chegirma (%)' },
  DISCOUNT_FIXED: { color: 'orange', label: "Chegirma (so'm)" },
};

interface PromoTableProps {
  data: Promo[];
  loading: boolean;
  pagination: TablePaginationConfig;
  onTableChange: (
    pagination: TablePaginationConfig,
    sorter: SorterResult<Promo> | SorterResult<Promo>[],
  ) => void;
}

export const PromoTable: React.FC<PromoTableProps> = ({
  data,
  loading,
  pagination,
  onTableChange,
}) => {
  const { mutate: deactivate, isPending } = useDeactivatePromo();

  const columns: ColumnsType<Promo> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: 'Turi',
      dataIndex: 'type',
      key: 'type',
      render: (type: PromoType) => (
        <Tag color={TYPE_CONFIG[type].color}>{TYPE_CONFIG[type].label}</Tag>
      ),
    },
    {
      title: 'Qiymat',
      dataIndex: 'value',
      key: 'value',
      render: (value: number, record: Promo) => {
        if (record.type === 'DISCOUNT_PERCENT') return `${value}%`;
        return `${value.toLocaleString()} so'm`;
      },
    },
    {
      title: 'Maks. foydalanish',
      dataIndex: 'maxUsages',
      key: 'maxUsages',
      render: (max: number | null) => max ?? 'Cheksiz',
    },
    {
      title: 'Ishlatilgan',
      dataIndex: 'usedCount',
      key: 'usedCount',
    },
    {
      title: 'Faol',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <Switch checked={isActive} disabled />,
    },
    {
      title: 'Amal muddati',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string | null) =>
        date ? dayjs(date).format('DD.MM.YYYY HH:mm') : 'Cheksiz',
    },
    {
      title: 'Yaratilgan',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Promo) => (
        record.isActive ? (
          <Popconfirm
            title="Promo kodni deaktivatsiya qilmoqchimisiz?"
            onConfirm={() => deactivate(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button
              type="text"
              danger
              icon={<StopOutlined />}
              loading={isPending}
              size="small"
            >
              Deaktivatsiya
            </Button>
          </Popconfirm>
        ) : (
          <Tag color="default">Nofaol</Tag>
        )
      ),
    },
  ];

  return (
    <Table<Promo>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `Jami: ${total}`,
      }}
      onChange={(pag, _filters, sorter) => onTableChange(pag, sorter)}
      scroll={{ x: 1100 }}
    />
  );
};
