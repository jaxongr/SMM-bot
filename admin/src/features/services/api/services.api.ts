import { api } from '@/shared/utils/axios';
import type { PaginatedResponse, ApiResponse, PaginationParams, Platform } from '@/shared/types';

export interface Category {
  id: string;
  name: Record<string, string>;
  slug: string;
  platform: Platform;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { services: number };
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  category?: Category;
  name: Record<string, string>;
  description: Record<string, string> | null;
  minQuantity: number;
  maxQuantity: number;
  pricePerUnit: number;
  isAutoService: boolean;
  isDripFeed: boolean;
  isActive: boolean;
  providerServiceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFiltersParams extends PaginationParams {
  categoryId?: string;
  platform?: Platform;
  isActive?: boolean;
}

export interface CreateCategoryData {
  name: Record<string, string>;
  slug: string;
  platform: Platform;
  icon?: string;
  sortOrder?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  isActive?: boolean;
}

export interface CreateServiceData {
  categoryId: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  minQuantity: number;
  maxQuantity: number;
  pricePerUnit: number;
  isAutoService?: boolean;
  isDripFeed?: boolean;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  isActive?: boolean;
}

export const servicesApi = {
  getCategories: async (platform?: Platform): Promise<ApiResponse<Category[]>> => {
    const { data } = await api.get('/categories', { params: platform ? { platform } : {} });
    return data;
  },

  createCategory: async (payload: CreateCategoryData): Promise<ApiResponse<Category>> => {
    const { data } = await api.post('/categories', payload);
    return data;
  },

  updateCategory: async (id: string, payload: UpdateCategoryData): Promise<ApiResponse<Category>> => {
    const { data } = await api.patch(`/categories/${id}`, payload);
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  getServices: async (params: ServiceFiltersParams): Promise<PaginatedResponse<Service>> => {
    const { data } = await api.get('/services', { params });
    return data;
  },

  getServiceById: async (id: string): Promise<ApiResponse<Service>> => {
    const { data } = await api.get(`/services/${id}`);
    return data;
  },

  createService: async (payload: CreateServiceData): Promise<ApiResponse<Service>> => {
    const { data } = await api.post('/services', payload);
    return data;
  },

  updateService: async (id: string, payload: UpdateServiceData): Promise<ApiResponse<Service>> => {
    const { data } = await api.patch(`/services/${id}`, payload);
    return data;
  },
};
