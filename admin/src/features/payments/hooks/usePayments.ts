import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getPayments,
  getPaymentById,
  approvePayment,
  type PaymentFilterParams,
} from '../api/payments.api';

const PAYMENTS_KEY = 'payments';

export const usePayments = (params: PaymentFilterParams) => {
  return useQuery({
    queryKey: [PAYMENTS_KEY, params],
    queryFn: () => getPayments(params),
  });
};

export const usePaymentById = (id: string) => {
  return useQuery({
    queryKey: [PAYMENTS_KEY, id],
    queryFn: () => getPaymentById(id),
    enabled: !!id,
  });
};

export const useApprovePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approvePayment(id),
    onSuccess: () => {
      message.success('Payment approved successfully');
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
    },
    onError: () => {
      message.error('Failed to approve payment');
    },
  });
};
