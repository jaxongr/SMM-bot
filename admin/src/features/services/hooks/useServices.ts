import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { servicesApi } from '../api/services.api';
import type {
  ServiceFiltersParams,
  CreateCategoryData,
  UpdateCategoryData,
  CreateServiceData,
  UpdateServiceData,
} from '../api/services.api';
import type { Platform } from '@/shared/types';

const CATEGORIES_KEY = 'categories';
const SERVICES_KEY = 'services';

export const useCategories = (platform?: Platform) => {
  return useQuery({
    queryKey: [CATEGORIES_KEY, platform],
    queryFn: () => servicesApi.getCategories(platform),
  });
};

export const useServices = (params: ServiceFiltersParams) => {
  return useQuery({
    queryKey: [SERVICES_KEY, params],
    queryFn: () => servicesApi.getServices(params),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryData) => servicesApi.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      message.success('Kategoriya yaratildi');
    },
    onError: () => {
      message.error('Kategoriya yaratishda xatolik');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryData }) =>
      servicesApi.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      message.success('Kategoriya yangilandi');
    },
    onError: () => {
      message.error('Kategoriya yangilashda xatolik');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CATEGORIES_KEY] });
      message.success("Kategoriya o'chirildi");
    },
    onError: () => {
      message.error("Kategoriya o'chirishda xatolik");
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceData) => servicesApi.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      message.success('Xizmat yaratildi');
    },
    onError: () => {
      message.error('Xizmat yaratishda xatolik');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceData }) =>
      servicesApi.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      message.success('Xizmat yangilandi');
    },
    onError: () => {
      message.error('Xizmat yangilashda xatolik');
    },
  });
};
