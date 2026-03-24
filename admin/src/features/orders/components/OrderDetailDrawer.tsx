import {
  Drawer,
  Descriptions,
  Steps,
  Button,
  Space,
  Spin,
  Empty,
  Popconfirm,
  Typography,
  Divider,
} from 'antd';
import {
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { OrderStatusTag } from './OrderStatusTag';
import { useOrderDetail, useCancelOrder, useRefillOrder } from '../hooks/useOrders';
import type { OrderStatus } from '@/shared/types';

const { Text, Link: AntLink } = Typography;

interface OrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
}

const CANCELABLE_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING'];
const REFILLABLE_STATUSES: OrderStatus[] = ['COMPLETED', 'PARTIAL'];

const STATUS_STEP_MAP: Record<OrderStatus, number> = {
  PENDING: 0,
  PROCESSING: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  PARTIAL: 3,
  CANCELED: 3,
  FAILED: 3,
};

const STATUS_STEP_STATUS_MAP: Record<OrderStatus, 'process' | 'finish' | 'error' | 'wait'> = {
  PENDING: 'process',
  PROCESSING: 'process',
  IN_PROGRESS: 'process',
  COMPLETED: 'finish',
  PARTIAL: 'finish',
  CANCELED: 'error',
  FAILED: 'error',
};

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  open,
  onClose,
  orderId,
}) => {
  const { data: orderData, isLoading } = useOrderDetail(orderId);
  const cancelOrder = useCancelOrder();
  const refillOrder = useRefillOrder();

  const order = orderData?.data;

  const canCancel = order && CANCELABLE_STATUSES.includes(order.status);
  const canRefill = order && REFILLABLE_STATUSES.includes(order.status);

  const handleCancel = () => {
    if (order) cancelOrder.mutate(order.id);
  };

  const handleRefill = () => {
    if (order) refillOrder.mutate(order.id);
  };

  const stepItems = [
    { title: 'Kutilmoqda', description: 'Buyurtma yaratildi' },
    { title: 'Qayta ishlanmoqda', description: 'Provayderga yuborildi' },
    { title: 'Jarayonda', description: 'Bajarilmoqda' },
    {
      title: order?.status === 'CANCELED'
        ? 'Bekor qilingan'
        : order?.status === 'FAILED'
          ? 'Xato'
          : order?.status === 'PARTIAL'
            ? 'Qisman bajarildi'
            : 'Bajarildi',
    },
  ];

  return (
    <Drawer
      title="Buyurtma tafsilotlari"
      open={open}
      onClose={onClose}
      width={580}
      destroyOnClose
      extra={
        order && (
          <Space>
            {canRefill && (
              <Button
                icon={<ReloadOutlined />}
                loading={refillOrder.isPending}
                onClick={handleRefill}
              >
                Qayta to'ldirish
              </Button>
            )}
            {canCancel && (
              <Popconfirm
                title="Buyurtmani bekor qilish?"
                onConfirm={handleCancel}
                okText="Ha"
                cancelText="Yo'q"
              >
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={cancelOrder.isPending}
                >
                  Bekor qilish
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      }
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : order ? (
        <>
          <Steps
            current={STATUS_STEP_MAP[order.status]}
            status={STATUS_STEP_STATUS_MAP[order.status]}
            items={stepItems}
            size="small"
            style={{ marginBottom: 24 }}
          />

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">
              <Text copyable style={{ fontFamily: 'monospace' }}>
                {order.id}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <OrderStatusTag status={order.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Foydalanuvchi">
              {order.user?.username
                ? `@${order.user.username}`
                : order.user?.telegramId ?? '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Xizmat">
              {order.service?.name?.uz ?? order.service?.name?.en ?? '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Link">
              <AntLink href={order.link} target="_blank">
                {order.link}
              </AntLink>
            </Descriptions.Item>
            <Descriptions.Item label="Miqdor">
              {order.quantity.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Narx">
              <Text strong>{order.totalPrice.toLocaleString()} so'm</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Provider">
              {order.providerName ?? '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Provider Order ID">
              {order.providerOrderId ?? '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Boshlang'ich son">
              {order.startCount?.toLocaleString() ?? '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Qolgan">
              {order.remains?.toLocaleString() ?? '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Yaratilgan">
              {dayjs(order.createdAt).format('DD.MM.YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Yangilangan">
              {dayjs(order.updatedAt).format('DD.MM.YYYY HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <>
              <Divider>Status tarixi</Divider>
              <Steps
                direction="vertical"
                size="small"
                current={order.statusHistory.length - 1}
                items={order.statusHistory.map((entry) => ({
                  title: <OrderStatusTag status={entry.status} />,
                  description: (
                    <div>
                      <Text type="secondary">
                        {dayjs(entry.timestamp).format('DD.MM.YYYY HH:mm:ss')}
                      </Text>
                      {entry.note && (
                        <div>
                          <Text>{entry.note}</Text>
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            </>
          )}
        </>
      ) : (
        <Empty description="Buyurtma topilmadi" />
      )}
    </Drawer>
  );
};
