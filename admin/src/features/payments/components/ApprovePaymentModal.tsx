import { Modal, Descriptions, Tag } from 'antd';
import dayjs from 'dayjs';
import type { Payment } from '../../../shared/types';

interface ApprovePaymentModalProps {
  payment: Payment | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const ApprovePaymentModal: React.FC<ApprovePaymentModalProps> = ({
  payment,
  open,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!payment) return null;

  return (
    <Modal
      title="Approve Payment"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Approve"
      okType="primary"
    >
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="ID">{payment.id}</Descriptions.Item>
        <Descriptions.Item label="User">
          {payment.user?.username || payment.userId}
        </Descriptions.Item>
        <Descriptions.Item label="Amount">
          {new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            maximumFractionDigits: 0,
          }).format(payment.amount)}
        </Descriptions.Item>
        <Descriptions.Item label="Method">
          <Tag>{payment.method}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="gold">{payment.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="External ID">
          {payment.externalId || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Created">
          {dayjs(payment.createdAt).format('DD.MM.YYYY HH:mm')}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ApprovePaymentModal;
