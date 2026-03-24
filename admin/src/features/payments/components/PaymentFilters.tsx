import { Card, Form, Select, DatePicker, Input, Button, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { PaymentStatus, PaymentMethod } from '../../../shared/types';

const { RangePicker } = DatePicker;

interface FilterValues {
  status?: PaymentStatus;
  method?: PaymentMethod;
  dateRange?: [Dayjs, Dayjs];
  search?: string;
}

interface PaymentFiltersProps {
  onFilter: (values: FilterValues) => void;
  onReset: () => void;
  loading?: boolean;
}

const PaymentFilters: React.FC<PaymentFiltersProps> = ({
  onFilter,
  onReset,
  loading,
}) => {
  const [form] = Form.useForm<FilterValues>();

  const handleFinish = (values: FilterValues) => {
    onFilter(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Form form={form} layout="inline" onFinish={handleFinish}>
        <Form.Item name="search">
          <Input
            placeholder="Search by user or ID"
            prefix={<SearchOutlined />}
            allowClear
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item name="status">
          <Select
            placeholder="Status"
            allowClear
            style={{ width: 140 }}
            options={[
              { label: 'Pending', value: 'PENDING' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Failed', value: 'FAILED' },
              { label: 'Canceled', value: 'CANCELED' },
            ]}
          />
        </Form.Item>
        <Form.Item name="method">
          <Select
            placeholder="Method"
            allowClear
            style={{ width: 140 }}
            options={[
              { label: 'Click', value: 'CLICK' },
              { label: 'Payme', value: 'PAYME' },
              { label: 'Crypto', value: 'CRYPTO' },
            ]}
          />
        </Form.Item>
        <Form.Item name="dateRange">
          <RangePicker />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Filter
            </Button>
            <Button icon={<ClearOutlined />} onClick={handleReset}>
              Reset
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PaymentFilters;
