import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getProviders,
  createProvider,
  updateProvider,
  syncProvider,
  getProviderBalance,
  getProviderServices,
  createMapping,
  deleteMapping,
  getMappings,
  type CreateProviderDto,
  type UpdateProviderDto,
  type CreateMappingDto,
} from '../api/providers.api';

const PROVIDERS_KEY = 'providers';
const PROVIDER_SERVICES_KEY = 'provider-services';
const MAPPINGS_KEY = 'service-mappings';

export const useProviders = () => {
  return useQuery({
    queryKey: [PROVIDERS_KEY],
    queryFn: getProviders,
  });
};

export const useCreateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProviderDto) => createProvider(data),
    onSuccess: () => {
      message.success('Provider created successfully');
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_KEY] });
    },
    onError: () => {
      message.error('Failed to create provider');
    },
  });
};

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProviderDto }) =>
      updateProvider(id, data),
    onSuccess: () => {
      message.success('Provider updated successfully');
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_KEY] });
    },
    onError: () => {
      message.error('Failed to update provider');
    },
  });
};

export const useSyncProvider = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => syncProvider(id),
    onSuccess: (result) => {
      message.success(`Synced ${result.data.synced} services`);
      queryClient.invalidateQueries({ queryKey: [PROVIDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROVIDER_SERVICES_KEY] });
    },
    onError: () => {
      message.error('Failed to sync provider');
    },
  });
};

export const useProviderBalance = (id: string) => {
  return useQuery({
    queryKey: [PROVIDERS_KEY, id, 'balance'],
    queryFn: () => getProviderBalance(id),
    enabled: !!id,
  });
};

export const useProviderServices = (id: string) => {
  return useQuery({
    queryKey: [PROVIDER_SERVICES_KEY, id],
    queryFn: () => getProviderServices(id),
    enabled: !!id,
  });
};

export const useCreateMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMappingDto) => createMapping(data),
    onSuccess: () => {
      message.success('Mapping created successfully');
      queryClient.invalidateQueries({ queryKey: [MAPPINGS_KEY] });
    },
    onError: () => {
      message.error('Failed to create mapping');
    },
  });
};

export const useDeleteMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMapping(id),
    onSuccess: () => {
      message.success('Mapping deleted successfully');
      queryClient.invalidateQueries({ queryKey: [MAPPINGS_KEY] });
    },
    onError: () => {
      message.error('Failed to delete mapping');
    },
  });
};

export const useMappings = (serviceId: string) => {
  return useQuery({
    queryKey: [MAPPINGS_KEY, serviceId],
    queryFn: () => getMappings(serviceId),
    enabled: !!serviceId,
  });
};
