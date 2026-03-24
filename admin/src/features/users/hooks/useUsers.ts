import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { usersApi } from '../api/users.api';
import type { UserFiltersParams, UpdateUserData, AdjustBalanceData } from '../api/users.api';
import type { PaginationParams } from '@/shared/types';

const USERS_KEY = 'users';

export const useUsers = (params: UserFiltersParams) => {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => usersApi.getUsers(params),
  });
};

export const useUserDetail = (id: string | null) => {
  return useQuery({
    queryKey: [USERS_KEY, id],
    queryFn: () => usersApi.getUserById(id!),
    enabled: !!id,
  });
};

export const useUserReferrals = (id: string | null, params: PaginationParams) => {
  return useQuery({
    queryKey: [USERS_KEY, id, 'referrals', params],
    queryFn: () => usersApi.getUserReferrals(id!, params),
    enabled: !!id,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      message.success("Foydalanuvchi ma'lumotlari yangilandi");
    },
    onError: () => {
      message.error('Xatolik yuz berdi');
    },
  });
};

export const useAdjustBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustBalanceData }) =>
      usersApi.adjustBalance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      message.success('Balans muvaffaqiyatli yangilandi');
    },
    onError: () => {
      message.error('Balansni yangilashda xatolik');
    },
  });
};

export const useToggleBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.toggleBlock(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
      const blocked = response.data.isBlocked;
      message.success(blocked ? 'Foydalanuvchi bloklandi' : 'Foydalanuvchi blokdan chiqarildi');
    },
    onError: () => {
      message.error('Xatolik yuz berdi');
    },
  });
};
