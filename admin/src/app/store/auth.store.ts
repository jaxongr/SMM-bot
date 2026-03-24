import { create } from 'zustand';
import type { User } from '@/shared/types/api.types';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/shared/utils/axios';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, refreshToken: string, user: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(AUTH_TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  user: (() => {
    try {
      const stored = localStorage.getItem('auth_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem(AUTH_TOKEN_KEY),

  setAuth: (token, refreshToken, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ token, refreshToken, user, isAuthenticated: true });
  },

  setUser: (user) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('auth_user');
    set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
  },
}));
