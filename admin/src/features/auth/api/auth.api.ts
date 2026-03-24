import { api } from '@/shared/utils/axios';
import type {
  ApiResponse,
  LoginResponse,
  RefreshResponse,
  User,
} from '@/shared/types/api.types';

export const authApi = {
  login: async (username: string, password: string) => {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      '/auth/admin/login',
      { username, password },
    );
    return data;
  },

  refreshToken: async (refreshToken: string) => {
    const { data } = await api.post<ApiResponse<RefreshResponse>>(
      '/auth/refresh',
      { refreshToken },
    );
    return data;
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },
};
