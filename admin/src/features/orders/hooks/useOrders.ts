import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { ordersApi } from '../api/orders.api';
import type { OrderFiltersParams } from '../api/orders.api';

const ORDERS_KEY = 'orders';

export const useOrders = (params: OrderFiltersParams) => {
  return useQuery({
    queryKey: [ORDERS_KEY, params],
    queryFn: () => ordersApi.getOrders(params),
  });
};

export const useOrderDetail = (id: string | null) => {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: () => ordersApi.getOrderById(id!),
    enabled: !!id,
  });
};

export const useOrderStats = () => {
  return useQuery({
    queryKey: [ORDERS_KEY, 'stats'],
    queryFn: () => ordersApi.getOrderStats(),
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      message.success('Buyurtma bekor qilindi');
    },
    onError: () => {
      message.error('Buyurtmani bekor qilishda xatolik');
    },
  });
};

export const useRefillOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.refillOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
      message.success("Buyurtma qayta to'ldirildi");
    },
    onError: () => {
      message.error("Qayta to'ldirishda xatolik");
    },
  });
};
