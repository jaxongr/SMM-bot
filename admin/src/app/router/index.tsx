import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Spin } from 'antd';
import { AppLayout } from '@/shared/components/AppLayout';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';

// Lazy-loaded pages (all have default exports)
const UsersPage = React.lazy(() => import('@/features/users'));
const ServicesPage = React.lazy(() => import('@/features/services'));
const OrdersPage = React.lazy(() => import('@/features/orders'));
const PaymentsPage = React.lazy(() => import('@/features/payments'));
const ProvidersPage = React.lazy(() => import('@/features/providers'));
const StatisticsPage = React.lazy(() => import('@/features/statistics'));
const SettingsPage = React.lazy(() => import('@/features/settings'));
const NotificationsPage = React.lazy(() => import('@/features/notifications'));
const SupportPage = React.lazy(() => import('@/features/support'));
const SmsPage = React.lazy(() => import('@/features/sms'));
const PromoPage = React.lazy(() => import('@/features/promo'));

const LazyFallback = (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
    <Spin size="large" />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: (
          <Suspense fallback={LazyFallback}>
            <UsersPage />
          </Suspense>
        ),
      },
      {
        path: 'services',
        element: (
          <Suspense fallback={LazyFallback}>
            <ServicesPage />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <Suspense fallback={LazyFallback}>
            <OrdersPage />
          </Suspense>
        ),
      },
      {
        path: 'payments',
        element: (
          <Suspense fallback={LazyFallback}>
            <PaymentsPage />
          </Suspense>
        ),
      },
      {
        path: 'providers',
        element: (
          <Suspense fallback={LazyFallback}>
            <ProvidersPage />
          </Suspense>
        ),
      },
      {
        path: 'statistics',
        element: (
          <Suspense fallback={LazyFallback}>
            <StatisticsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={LazyFallback}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={LazyFallback}>
            <NotificationsPage />
          </Suspense>
        ),
      },
      {
        path: 'support',
        element: (
          <Suspense fallback={LazyFallback}>
            <SupportPage />
          </Suspense>
        ),
      },
      {
        path: 'sms',
        element: (
          <Suspense fallback={LazyFallback}>
            <SmsPage />
          </Suspense>
        ),
      },
      {
        path: 'promo',
        element: (
          <Suspense fallback={LazyFallback}>
            <PromoPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
