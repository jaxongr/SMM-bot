import { api } from '../../../shared/utils/axios';
import type {
  ApiResponse,
  Provider,
  ProviderService,
  ServiceMapping,
} from '../../../shared/types';

export interface CreateProviderDto {
  name: string;
  apiUrl: string;
  apiKey: string;
  description?: string;
  priority?: number;
}

export interface UpdateProviderDto extends Partial<CreateProviderDto> {
  isActive?: boolean;
}

export interface CreateMappingDto {
  serviceId: string;
  providerServiceId: string;
  providerId: string;
  priority?: number;
}

export const getProviders = async (): Promise<ApiResponse<Provider[]>> => {
  const { data } = await api.get('/providers');
  return data;
};

export const createProvider = async (
  payload: CreateProviderDto,
): Promise<ApiResponse<Provider>> => {
  const { data } = await api.post('/providers', payload);
  return data;
};

export const updateProvider = async (
  id: string,
  payload: UpdateProviderDto,
): Promise<ApiResponse<Provider>> => {
  const { data } = await api.patch(`/providers/${id}`, payload);
  return data;
};

export const syncProvider = async (
  id: string,
): Promise<ApiResponse<{ synced: number }>> => {
  const { data } = await api.post(`/providers/${id}/sync`);
  return data;
};

export const getProviderBalance = async (
  id: string,
): Promise<ApiResponse<{ balance: number }>> => {
  const { data } = await api.get(`/providers/${id}/balance`);
  return data;
};

export const getProviderServices = async (
  id: string,
): Promise<ApiResponse<ProviderService[]>> => {
  const { data } = await api.get(`/providers/${id}/services`);
  return data;
};

export const createMapping = async (
  payload: CreateMappingDto,
): Promise<ApiResponse<ServiceMapping>> => {
  const { data } = await api.post('/providers/mappings', payload);
  return data;
};

export const deleteMapping = async (
  id: string,
): Promise<ApiResponse<{ deleted: boolean }>> => {
  const { data } = await api.delete(`/providers/mappings/${id}`);
  return data;
};

export const getMappings = async (
  serviceId: string,
): Promise<ApiResponse<ServiceMapping[]>> => {
  const { data } = await api.get(`/providers/mappings/service/${serviceId}`);
  return data;
};
