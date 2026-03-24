import { useState, useCallback } from 'react';
import { Typography } from 'antd';
import styled from 'styled-components';
import dayjs from 'dayjs';
import PaymentsTable from './components/PaymentsTable';
import PaymentFilters from './components/PaymentFilters';
import ApprovePaymentModal from './components/ApprovePaymentModal';
import { usePayments, useApprovePayment } from './hooks/usePayments';
import type { Payment, PaymentStatus, PaymentMethod } from '../../shared/types';
import type { PaymentFilterParams } from './api/payments.api';

const PageWrapper = styled.div`
  padding: 24px;
`;

const PaymentsPage: React.FC = () => {
  const [filters, setFilters] = useState<PaymentFilterParams>({
    page: 1,
    limit: 20,
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = usePayments(filters);
  const approveMutation = useApprovePayment();

  const handleFilter = useCallback(
    (values: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
      search?: string;
    }) => {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        status: values.status,
        method: values.method,
        search: values.search,
        dateFrom: values.dateRange?.[0]?.toISOString(),
        dateTo: values.dateRange?.[1]?.toISOString(),
      }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setFilters({ page: 1, limit: 20 });
  }, []);

  const handlePageChange = useCallback((page: number, limit: number) => {
    setFilters((prev) => ({ ...prev, page, limit }));
  }, []);

  const handleApprove = useCallback((id: string) => {
    const payment = data?.data.find((p) => p.id === id);
    if (payment) {
      setSelectedPayment(payment);
      setModalOpen(true);
    }
  }, [data]);

  const handleConfirmApprove = useCallback(() => {
    if (selectedPayment) {
      approveMutation.mutate(selectedPayment.id, {
        onSuccess: () => {
          setModalOpen(false);
          setSelectedPayment(null);
        },
      });
    }
  }, [selectedPayment, approveMutation]);

  return (
    <PageWrapper>
      <Typography.Title level={2}>Payments</Typography.Title>

      <PaymentFilters
        onFilter={handleFilter}
        onReset={handleReset}
        loading={isLoading}
      />

      <PaymentsTable
        data={data?.data ?? []}
        loading={isLoading}
        total={data?.meta?.total ?? 0}
        page={filters.page ?? 1}
        limit={filters.limit ?? 20}
        onPageChange={handlePageChange}
        onApprove={handleApprove}
        approving={approveMutation.isPending}
      />

      <ApprovePaymentModal
        payment={selectedPayment}
        open={modalOpen}
        onConfirm={handleConfirmApprove}
        onCancel={() => {
          setModalOpen(false);
          setSelectedPayment(null);
        }}
        loading={approveMutation.isPending}
      />
    </PageWrapper>
  );
};

export { PaymentsPage };
export default PaymentsPage;
