import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { AppHeader } from './Header';
import { useAuthStore } from '@/app/store/auth.store';

const { Sider, Header, Content } = Layout;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledSider = styled(Sider)`
  background: #fff !important;
  border-right: 1px solid #f0f0f0;

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
  }
`;

const Logo = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #722ed1;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledHeader = styled(Header)`
  background: #fff !important;
  padding: 0;
  border-bottom: 1px solid #f0f0f0;
  height: 64px;
  line-height: 64px;
`;

const StyledContent = styled(Content)`
  margin: 24px;
  min-height: 280px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 48px;
`;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <StyledLayout>
      <StyledSider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        breakpoint="lg"
      >
        <Logo>{collapsed ? 'SMM' : 'SMM Admin'}</Logo>
        <Sidebar />
      </StyledSider>
      <Layout>
        <StyledHeader>
          <AppHeader />
        </StyledHeader>
        <StyledContent>
          <React.Suspense
            fallback={
              <LoadingWrapper>
                <Spin size="large" />
              </LoadingWrapper>
            }
          >
            <Outlet />
          </React.Suspense>
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
}
