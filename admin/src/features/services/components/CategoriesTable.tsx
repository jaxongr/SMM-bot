import { Table, Tag, Button, Space, Tooltip, Popconfirm, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Category } from '../api/services.api';
import type { Platform } from '@/shared/types';

interface CategoriesTableProps {
  data: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  deleteLoading: boolean;
}

const PLATFORM_COLOR_MAP: Record<Platform, string> = {
  TELEGRAM: 'blue',
  INSTAGRAM: 'magenta',
  YOUTUBE: 'red',
  TIKTOK: 'purple',
};

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onToggleActive,
  deleteLoading,
}) => {
  const columns: ColumnsType<Category> = [
    {
      title: 'Nomi (UZ)',
      key: 'name',
      render: (_: unknown, record: Category) => record.name.uz ?? record.name.en ?? '--',
    },
    {
      title: 'Platforma',
      dataIndex: 'platform',
      key: 'platform',
      width: 130,
      render: (platform: Platform) => (
        <Tag color={PLATFORM_COLOR_MAP[platform]}>{platform}</Tag>
      ),
    },
    {
      title: 'Xizmatlar soni',
      key: 'servicesCount',
      width: 130,
      render: (_: unknown, record: Category) => record._count?.services ?? 0,
    },
    {
      title: 'Tartib',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      sorter: (a: Category, b: Category) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Holat',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean, record: Category) => (
        <Switch
          checked={isActive}
          size="small"
          onChange={(checked) => onToggleActive(record.id, checked)}
        />
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Category) => (
        <Space size="small">
          <Tooltip title="Tahrirlash">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Kategoriyani o'chirish?"
            description="Bu amalni qaytarib bo'lmaydi"
            onConfirm={() => onDelete(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Tooltip title="O'chirish">
              <Button
                type="text"
                danger
                loading={deleteLoading}
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
          Yangi kategoriya
        </Button>
      </div>
      <Table<Category>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};
