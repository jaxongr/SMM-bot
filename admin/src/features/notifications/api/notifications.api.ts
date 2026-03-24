import { api } from '../../../shared/utils/axios';
import type {
  PaginatedResponse,
  PaginationParams,
  Notification,
  NotificationTarget,
  ApiResponse,
} from '../../../shared/types';

export interface CreateNotificationDto {
  titleUz: string;
  titleRu?: string;
  titleEn?: string;
  messageUz: string;
  messageRu?: string;
  messageEn?: string;
  target: NotificationTarget;
  targetId?: string;
}

export const getNotifications = async (
  params: PaginationParams,
): Promise<PaginatedResponse<Notification>> => {
  const { data } = await api.get('/notifications', { params });
  return data;
};

export const createNotification = async (
  payload: CreateNotificationDto,
): Promise<ApiResponse<Notification>> => {
  const { data } = await api.post('/notifications', payload);
  return data;
};
