import { useEffect, useState, type ReactNode } from 'react';
import { Spin } from 'antd';
import styled from 'styled-components';
import { useAuthStore } from '@/app/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';

interface AuthProviderProps {
  children: ReactNode;
}

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

export function AuthProvider({ children }: AuthProviderProps) {
  const [isChecking, setIsChecking] = useState(true);
  const { token, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        const refreshToken = localStorage.getItem('auth_refresh_token');
        setAuth(token, refreshToken || '', response.data);
      } catch {
        clearAuth();
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isChecking) {
    return (
      <LoadingWrapper>
        <Spin size="large" />
      </LoadingWrapper>
    );
  }

  return <>{children}</>;
}
