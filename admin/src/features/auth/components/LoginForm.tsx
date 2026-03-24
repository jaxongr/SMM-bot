import { Button, Form, Input, Typography } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useLogin } from '@/features/auth/hooks/useLogin';
import type { LoginRequest } from '@/shared/types/api.types';

const { Title, Text } = Typography;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

export function LoginForm() {
  const { mutate: login, isPending } = useLogin();

  const onFinish = (values: LoginRequest) => {
    login(values);
  };

  return (
    <FormWrapper>
      <LogoSection>
        <Title level={3} style={{ margin: 0, color: '#722ED1' }}>
          SMM Admin
        </Title>
        <Text type="secondary">Boshqaruv paneliga kirish</Text>
      </LogoSection>

      <Form<LoginRequest>
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Login kiriting' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Login"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Parol kiriting' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Parol"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isPending}
            style={{ height: 44, borderRadius: 8, background: '#722ED1' }}
          >
            Kirish
          </Button>
        </Form.Item>
      </Form>
    </FormWrapper>
  );
}
