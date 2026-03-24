import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAuthStore } from '@/app/store/auth.store';

const PageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f0ff 0%, #ede7f6 100%);
`;

export function LoginPage() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageWrapper>
      <LoginForm />
    </PageWrapper>
  );
}
