import { api } from '@/shared/utils/axios';
import type { PaginatedResponse, ApiResponse, PaginationParams } from '@/shared/types';

export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  balance: number;
  role: UserRole;
  isBlocked: boolean;
  referralCode: string | null;
  referredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR';

export interface UserFiltersParams extends PaginationParams {
  role?: UserRole;
  isBlocked?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export interface AdjustBalanceData {
  amount: number;
  description: string;
}

export interface UserReferral {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  createdAt: string;
}

export const usersApi = {
  getUsers: async (params: UserFiltersParams): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  updateUser: async (id: string, payload: UpdateUserData): Promise<ApiResponse<User>> => {
    const { data } = await api.patch(`/users/${id}`, payload);
    return data;
  },

  adjustBalance: async (id: string, payload: AdjustBalanceData): Promise<ApiResponse<User>> => {
    const { data } = await api.patch(`/users/${id}/balance`, payload);
    return data;
  },

  toggleBlock: async (id: string): Promise<ApiResponse<User>> => {
    const { data } = await api.patch(`/users/${id}/block`);
    return data;
  },

  getUserReferrals: async (
    id: string,
    params: PaginationParams,
  ): Promise<PaginatedResponse<UserReferral>> => {
    const { data } = await api.get(`/users/${id}/referrals`, { params });
    return data;
  },
};
