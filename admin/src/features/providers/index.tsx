import { useState, useCallback } from 'react';
import { Typography, Button, Space } from 'antd';
import { PlusOutlined, NodeIndexOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import ProvidersTable from './components/ProvidersTable';
import ProviderFormModal from './components/ProviderFormModal';
import ProviderServicesDrawer from './components/ProviderServicesDrawer';
import ServiceMappingModal from './components/ServiceMappingModal';
import {
  useProviders,
  useCreateProvider,
  useUpdateProvider,
  useSyncProvider,
  useProviderServices,
  useCreateMapping,
} from './hooks/useProviders';
import type { Provider, ProviderService } from '../../shared/types';
import type { CreateProviderDto, CreateMappingDto } from './api/providers.api';

const PageWrapper = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ProvidersPage: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [mappingProviderId, setMappingProviderId] = useState('');

  const { data, isLoading } = useProviders();
  const createMutation = useCreateProvider();
  const updateMutation = useUpdateProvider();
  const syncMutation = useSyncProvider();
  const createMappingMutation = useCreateMapping();
  const { data: providerServicesData } =
    useProviderServices(mappingProviderId);

  const handleEdit = useCallback((provider: Provider) => {
    setEditingProvider(provider);
    setFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setEditingProvider(null);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (values: CreateProviderDto) => {
      if (editingProvider) {
        updateMutation.mutate(
          { id: editingProvider.id, data: values },
          {
            onSuccess: () => {
              setFormOpen(false);
              setEditingProvider(null);
            },
          },
        );
      } else {
        createMutation.mutate(values, {
          onSuccess: () => {
            setFormOpen(false);
          },
        });
      }
    },
    [editingProvider, createMutation, updateMutation],
  );

  const handleSync = useCallback(
    (id: string) => {
      syncMutation.mutate(id);
    },
    [syncMutation],
  );

  const handleViewServices = useCallback((provider: Provider) => {
    setSelectedProvider(provider);
    setDrawerOpen(true);
  }, []);

  const handleToggleActive = useCallback(
    (id: string, active: boolean) => {
      updateMutation.mutate({ id, data: { isActive: active } });
    },
    [updateMutation],
  );

  const handleMappingSubmit = useCallback(
    (values: CreateMappingDto) => {
      createMappingMutation.mutate(values, {
        onSuccess: () => setMappingOpen(false),
      });
    },
    [createMappingMutation],
  );

  return (
    <PageWrapper>
      <Header>
        <Typography.Title level={2} style={{ margin: 0 }}>
          Providers
        </Typography.Title>
        <Space>
          <Button
            icon={<NodeIndexOutlined />}
            onClick={() => setMappingOpen(true)}
          >
            Service Mapping
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Provider
          </Button>
        </Space>
      </Header>

      <ProvidersTable
        data={data?.data ?? []}
        loading={isLoading}
        onEdit={handleEdit}
        onSync={handleSync}
        onViewServices={handleViewServices}
        onToggleActive={handleToggleActive}
        syncing={syncMutation.isPending}
      />

      <ProviderFormModal
        open={formOpen}
        editingProvider={editingProvider}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setFormOpen(false);
          setEditingProvider(null);
        }}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ProviderServicesDrawer
        provider={selectedProvider}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedProvider(null);
        }}
      />

      <ServiceMappingModal
        open={mappingOpen}
        providers={data?.data ?? []}
        providerServices={
          (providerServicesData?.data as ProviderService[]) ?? []
        }
        localServices={[]}
        onSubmit={handleMappingSubmit}
        onCancel={() => setMappingOpen(false)}
        onProviderChange={setMappingProviderId}
        loading={createMappingMutation.isPending}
      />
    </PageWrapper>
  );
};

export { ProvidersPage };
export default ProvidersPage;
