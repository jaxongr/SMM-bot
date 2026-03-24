import { Button, Typography, Space, Dropdown } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAuthStore } from '@/app/store/auth.store';
import { useAuth } from '@/shared/hooks/useAuth';

const { Text } = Typography;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  padding: 0 24px;
`;

const UserInfo = styled(Space)`
  cursor: pointer;
`;

export function AppHeader() {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const displayName =
    user?.firstName || user?.username || 'Admin';

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Chiqish',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <HeaderWrapper>
      <Dropdown menu={{ items: menuItems }} trigger={['click']}>
        <UserInfo>
          <Button type="text" icon={<UserOutlined />}>
            <Text strong>{displayName}</Text>
          </Button>
        </UserInfo>
      </Dropdown>
    </HeaderWrapper>
  );
}
