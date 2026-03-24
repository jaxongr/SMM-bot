import { api } from '@/shared/utils/axios';
import type { PaginatedResponse, ApiResponse, PaginationParams } from '@/shared/types';

export type PromoType = 'BALANCE_BONUS' | 'DISCOUNT_PERCENT' | 'DISCOUNT_FIXED';

export interface Promo {
  id: string;
  code: string;
  type: PromoType;
  value: number;
  maxUsages: number | null;
  usedCount: number;
  isActive: boolean;
  description: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromoFiltersParams extends PaginationParams {
  isActive?: boolean;
  type?: PromoType;
}

export interface CreatePromoPayload {
  code: string;
  type: PromoType;
  value: number;
  maxUsages?: number | null;
  expiresAt?: string | null;
  description?: string | null;
}

export interface PromoStats {
  totalPromos: number;
  activePromos: number;
  totalUsages: number;
  totalBonusGiven: number;
}

export const promoApi = {
  getPromos: async (params: PromoFiltersParams): Promise<PaginatedResponse<Promo>> => {
    const { data } = await api.get('/promo', { params });
    return data;
  },

  createPromo: async (payload: CreatePromoPayload): Promise<ApiResponse<Promo>> => {
    const { data } = await api.post('/promo', payload);
    return data;
  },

  deactivatePromo: async (id: string): Promise<ApiResponse<Promo>> => {
    const { data } = await api.patch(`/promo/${id}/deactivate`);
    return data;
  },

  getStats: async (): Promise<ApiResponse<PromoStats>> => {
    const { data } = await api.get('/promo/stats');
    return data;
  },
};
