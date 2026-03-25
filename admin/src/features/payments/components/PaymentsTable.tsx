import { Table, Tag, Button, Space, Tooltip, Image, Modal } from 'antd';
import { CheckOutlined, EyeOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Payment, PaymentMethod, PaymentStatus } from '../../../shared/types';

const BOT_TOKEN = '8791580167:AAEgqlh-LxIro1v8G8PsBEGVPz8FMbzXepY';

const METHOD_COLORS: Record<string, string> = {
  CLICK: 'blue',
  PAYME: 'green',
  CRYPTO: 'orange',
  BANK: 'purple',
  HUMO: 'gold',
  ADMIN: 'default',
};

const METHOD_LABELS: Record<string, string> = {
  CLICK: '💳 Click',
  PAYME: '💳 Payme',
  CRYPTO: '💎 Crypto',
  BANK: '🏦 Bank karta',
  HUMO: '🟡 HumoCard',
  ADMIN: '👨‍💻 Admin',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'gold',
  COMPLETED: 'green',
  FAILED: 'red',
  CANCELED: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: '⏳ Kutilmoqda',
  COMPLETED: '✅ Tasdiqlangan',
  FAILED: '❌ Rad etilgan',
  CANCELED: '🚫 Bekor',
};

function getReceiptUrl(metadata: Record<string, unknown> | null): string | null {
  if (!metadata) return null;
  const fileId = metadata.receiptFileId as string;
  if (!fileId) return null;
  return `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
}

interface PaymentsTableProps {
  data: Payment[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number, limit: number) => void;
  onApprove: (id: string) => void;
  approving: boolean;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  data,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onApprove,
  approving,
}) => {
  const [receiptModal, setReceiptModal] = useState<{ visible: boolean; url: string; payment: Payment | null }>({
    visible: false,
    url: '',
    payment: null,
  });

  const showReceipt = async (payment: Payment) => {
    const metadata = payment.metadata as Record<string, unknown> | null;
    const fileId = metadata?.receiptFileId as string;
    if (!fileId) return;

    try {
      const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
      const data = await resp.json();
      if (data.ok && data.result?.file_path) {
        const imageUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
        setReceiptModal({ visible: true, url: imageUrl, payment });
      }
    } catch {
      // ignore
    }
  };

  const columns: ColumnsType<Payment> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string) => (
        <Tooltip title={id}>{id.slice(0, 8)}...</Tooltip>
      ),
    },
    {
      title: 'Foydalanuvchi',
      dataIndex: 'user',
      key: 'user',
      render: (_: unknown, record: Payment) => {
        const meta = record.metadata as Record<string, unknown> | null;
        const name = meta?.firstName || (record as Record<string, unknown>).user;
        const username = meta?.username;
        return (
          <div>
            <div><b>{String(name || '-')}</b></div>
            {username && <div style={{ color: '#888', fontSize: 12 }}>@{String(username)}</div>}
          </div>
        );
      },
    },
    {
      title: 'Summa',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string | number) => (
        <b>{Number(amount).toLocaleString()} so'm</b>
      ),
    },
    {
      title: 'Usul',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag color={METHOD_COLORS[method] || 'default'}>
          {METHOD_LABELS[method] || method}
        </Tag>
      ),
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
          {STATUS_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Chek',
      key: 'receipt',
      width: 80,
      render: (_: unknown, record: Payment) => {
        const meta = record.metadata as Record<string, unknown> | null;
        const hasReceipt = !!meta?.receiptFileId;
        return hasReceipt ? (
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showReceipt(record)}
          >
            Ko'rish
          </Button>
        ) : '-';
      },
    },
    {
      title: 'Sana',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (_: unknown, record: Payment) => (
        <Space>
          {record.status === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              loading={approving}
              onClick={() => onApprove(record.id)}
            >
              Tasdiqlash
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table<Payment>
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
      <Modal
        title={`📸 To'lov cheki — ${Number((receiptModal.payment?.amount as string | number) || 0).toLocaleString()} so'm`}
        open={receiptModal.visible}
        onCancel={() => setReceiptModal({ visible: false, url: '', payment: null })}
        footer={
          receiptModal.payment?.status === 'PENDING' ? (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={approving}
              onClick={() => {
                onApprove(receiptModal.payment!.id);
                setReceiptModal({ visible: false, url: '', payment: null });
              }}
            >
              Tasdiqlash
            </Button>
          ) : null
        }
        width={600}
      >
        {receiptModal.url && (
          <Image
            src={receiptModal.url}
            alt="To'lov cheki"
            style={{ width: '100%' }}
          />
        )}
      </Modal>
    </>
  );
};

export default PaymentsTable;
