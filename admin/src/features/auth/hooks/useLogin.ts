import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/app/store/auth.store';
import type { LoginRequest } from '@/shared/types/api.types';

export function useLogin() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      authApi.login(credentials.username, credentials.password),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user } = response.data;
      setAuth(accessToken, refreshToken, user);
      message.success('Tizimga muvaffaqiyatli kirdingiz');
      navigate('/', { replace: true });
    },
    onError: () => {
      message.error('Login yoki parol noto\'g\'ri');
    },
  });
}
