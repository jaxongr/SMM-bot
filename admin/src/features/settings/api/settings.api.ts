import { api } from '../../../shared/utils/axios';
import type { ApiResponse, Setting } from '../../../shared/types';

export const getSettings = async (
  group?: string,
): Promise<ApiResponse<Setting[]>> => {
  const params = group ? { group } : {};
  const { data } = await api.get('/settings', { params });
  return data;
};

export const updateSetting = async (
  key: string,
  value: string,
): Promise<ApiResponse<Setting>> => {
  const { data } = await api.patch(`/settings/${key}`, { value });
  return data;
};

export const bulkUpdateSettings = async (
  settings: { key: string; value: string }[],
): Promise<ApiResponse<Setting[]>> => {
  const { data } = await api.patch('/settings/bulk', { settings });
  return data;
};
