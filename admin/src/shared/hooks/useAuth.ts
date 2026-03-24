import { useCallback } from 'react';
import { useAuthStore } from '@/app/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';

export function useAuth() {
  const { user, isAuthenticated, token, setAuth, clearAuth, setUser } =
    useAuthStore();

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await authApi.login(username, password);
      const { accessToken, refreshToken, user: userData } = response.data;
      setAuth(accessToken, refreshToken, userData);
      return userData;
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data);
      return response.data;
    } catch {
      clearAuth();
      return null;
    }
  }, [setUser, clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading: false,
    token,
    login,
    logout,
    refreshUser,
  };
}
