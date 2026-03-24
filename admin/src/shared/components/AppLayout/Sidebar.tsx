import { useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  ApiOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
  GiftOutlined,
} from '@ant-design/icons';

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/users', icon: <UserOutlined />, label: 'Foydalanuvchilar' },
  { key: '/services', icon: <AppstoreOutlined />, label: 'Xizmatlar' },
  { key: '/sms', icon: <PhoneOutlined />, label: 'SMS Aktivatsiya' },
  { key: '/orders', icon: <ShoppingCartOutlined />, label: 'Buyurtmalar' },
  { key: '/payments', icon: <WalletOutlined />, label: "To'lovlar" },
  { key: '/providers', icon: <ApiOutlined />, label: 'Provayderlar' },
  { key: '/statistics', icon: <BarChartOutlined />, label: 'Statistika' },
  { key: '/settings', icon: <SettingOutlined />, label: 'Sozlamalar' },
  { key: '/notifications', icon: <BellOutlined />, label: 'Bildirishnomalar' },
  { key: '/promo', icon: <GiftOutlined />, label: 'Promo kodlar' },
  { key: '/support', icon: <CustomerServiceOutlined />, label: "Qo'llab-quvvatlash" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = menuItems
    .filter((item) => item.key !== '/')
    .find((item) => location.pathname.startsWith(item.key))?.key
    || (location.pathname === '/' ? '/' : '');

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      onClick={({ key }) => navigate(key)}
      style={{ borderRight: 0, paddingTop: 8 }}
    />
  );
}
