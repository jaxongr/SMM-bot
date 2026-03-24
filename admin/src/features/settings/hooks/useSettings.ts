import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  getSettings,
  updateSetting,
  bulkUpdateSettings,
} from '../api/settings.api';

const SETTINGS_KEY = 'settings';

export const useSettings = (group?: string) => {
  return useQuery({
    queryKey: [SETTINGS_KEY, group],
    queryFn: () => getSettings(group),
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSetting(key, value),
    onSuccess: () => {
      message.success('Setting updated successfully');
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] });
    },
    onError: () => {
      message.error('Failed to update setting');
    },
  });
};

export const useBulkUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: { key: string; value: string }[]) =>
      bulkUpdateSettings(settings),
    onSuccess: () => {
      message.success('Settings updated successfully');
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] });
    },
    onError: () => {
      message.error('Failed to update settings');
    },
  });
};
