import { api } from '../../../shared/utils/axios';
import type {
  PaginatedResponse,
  PaginationParams,
  Payment,
  PaymentMethod,
  PaymentStatus,
  ApiResponse,
} from '../../../shared/types';

export interface PaymentFilterParams extends PaginationParams {
  status?: PaymentStatus;
  method?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}

export const getPayments = async (
  params: PaymentFilterParams,
): Promise<PaginatedResponse<Payment>> => {
  const { data } = await api.get('/payments', { params });
  return data;
};

export const getPaymentById = async (
  id: string,
): Promise<ApiResponse<Payment>> => {
  const { data } = await api.get(`/payments/${id}`);
  return data;
};

export const approvePayment = async (
  id: string,
): Promise<ApiResponse<Payment>> => {
  const { data } = await api.patch(`/payments/${id}/approve`);
  return data;
};
