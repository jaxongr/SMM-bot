import { Modal, Form, InputNumber, Input, Typography } from 'antd';
import { useAdjustBalance } from '../hooks/useUsers';

const { Text } = Typography;

interface AdjustBalanceModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  currentBalance: number;
  userName: string;
}

interface BalanceFormValues {
  amount: number;
  description: string;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  open,
  onClose,
  userId,
  currentBalance,
  userName,
}) => {
  const [form] = Form.useForm<BalanceFormValues>();
  const adjustBalance = useAdjustBalance();

  const handleSubmit = async () => {
    if (!userId) return;
    const values = await form.validateFields();
    await adjustBalance.mutateAsync({
      id: userId,
      data: values,
    });
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Balansni o'zgartirish"
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      confirmLoading={adjustBalance.isPending}
      okText="Saqlash"
      cancelText="Bekor qilish"
    >
      <div style={{ marginBottom: 16 }}>
        <Text>Foydalanuvchi: </Text>
        <Text strong>{userName}</Text>
        <br />
        <Text>Joriy balans: </Text>
        <Text strong>{currentBalance.toLocaleString()} so'm</Text>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="amount"
          label="Miqdor"
          rules={[
            { required: true, message: 'Miqdorni kiriting' },
            {
              type: 'number',
              validator: (_, value: number) =>
                value !== 0 ? Promise.resolve() : Promise.reject('Miqdor 0 bo\'lmasligi kerak'),
            },
          ]}
          extra="Musbat qiymat qo'shadi, manfiy qiymat ayiradi"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Masalan: 10000 yoki -5000"
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => Number(value?.replace(/,/g, '') ?? 0)}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Izoh"
          rules={[{ required: true, message: 'Izoh kiriting' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Balans o'zgartirish sababi..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
