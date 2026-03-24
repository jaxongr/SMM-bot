import { ConfigProvider } from 'antd';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { AppRouter } from '@/app/router';

const themeConfig = {
  token: {
    colorPrimary: '#722ED1',
    borderRadius: 8,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
};

function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <QueryProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryProvider>
    </ConfigProvider>
  );
}

export default App;
