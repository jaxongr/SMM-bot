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
  // Transform to backend format
  const backendPayload = {
    title: {
      uz: payload.titleUz,
      ru: payload.titleRu || payload.titleUz,
      en: payload.titleEn || payload.titleUz,
    },
    message: {
      uz: payload.messageUz,
      ru: payload.messageRu || payload.messageUz,
      en: payload.messageEn || payload.messageUz,
    },
    targetType: payload.target,
    targetId: payload.targetId,
  };
  const { data } = await api.post('/notifications', backendPayload);
  return data;
};
