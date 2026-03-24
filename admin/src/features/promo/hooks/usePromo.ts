import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { promoApi } from '../api/promo.api';
import type { PromoFiltersParams, CreatePromoPayload } from '../api/promo.api';

const PROMO_KEY = 'promos';

export const usePromos = (params: PromoFiltersParams) => {
  return useQuery({
    queryKey: [PROMO_KEY, params],
    queryFn: () => promoApi.getPromos(params),
  });
};

export const usePromoStats = () => {
  return useQuery({
    queryKey: [PROMO_KEY, 'stats'],
    queryFn: () => promoApi.getStats(),
  });
};

export const useCreatePromo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePromoPayload) => promoApi.createPromo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMO_KEY] });
      message.success('Promo kod yaratildi');
    },
    onError: () => {
      message.error('Promo kod yaratishda xatolik');
    },
  });
};

export const useDeactivatePromo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promoApi.deactivatePromo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMO_KEY] });
      message.success('Promo kod deaktivatsiya qilindi');
    },
    onError: () => {
      message.error('Deaktivatsiya qilishda xatolik');
    },
  });
};
