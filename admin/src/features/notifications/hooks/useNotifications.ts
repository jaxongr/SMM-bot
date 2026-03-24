import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import type { PaginationParams } from '../../../shared/types';
import {
  getNotifications,
  createNotification,
  type CreateNotificationDto,
} from '../api/notifications.api';

const NOTIFICATIONS_KEY = 'notifications';

export const useNotifications = (params: PaginationParams) => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, params],
    queryFn: () => getNotifications(params),
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNotificationDto) => createNotification(data),
    onSuccess: () => {
      message.success('Notification sent successfully');
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
    onError: () => {
      message.error('Failed to send notification');
    },
  });
};
