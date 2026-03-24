import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationTarget, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { buildPaginationMeta, getPaginationParams, PaginationParams } from '../../common/types/response.type';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('order-notifications') private readonly notificationQueue: Queue,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        title: dto.title as unknown as Prisma.InputJsonValue,
        message: dto.message as unknown as Prisma.InputJsonValue,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });

    const userIds = await this.resolveTargetUsers(dto.targetType, dto.targetId);

    if (userIds.length > 0) {
      const BATCH_SIZE = 500;
      for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
        const batch = userIds.slice(i, i + BATCH_SIZE);
        await this.prisma.userNotification.createMany({
          data: batch.map((userId) => ({
            userId,
            notificationId: notification.id,
          })),
          skipDuplicates: true,
        });
      }

      await this.notificationQueue.add('send-telegram-notifications', {
        notificationId: notification.id,
        title: dto.title,
        message: dto.message,
        userIds,
      });
    }

    this.logger.log(`Notification created: id=${notification.id}, target=${dto.targetType}, recipients=${userIds.length}`);

    return { data: notification };
  }

  async findAll(params: PaginationParams) {
    const { page, limit, skip } = getPaginationParams(params);

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { recipients: true } },
        },
      }),
      this.prisma.notification.count(),
    ]);

    return {
      data: notifications,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getUserNotifications(userId: string, params: PaginationParams) {
    const { page, limit, skip } = getPaginationParams(params);

    const where: Prisma.UserNotificationWhereInput = { userId };

    const [userNotifications, total] = await Promise.all([
      this.prisma.userNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          notification: true,
        },
      }),
      this.prisma.userNotification.count({ where }),
    ]);

    return {
      data: userNotifications,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async markAsRead(id: string, userId: string) {
    const userNotification = await this.prisma.userNotification.findFirst({
      where: { id, userId },
    });

    if (!userNotification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.userNotification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return { data: updated };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.userNotification.count({
      where: { userId, isRead: false },
    });

    return { data: { count } };
  }

  private async resolveTargetUsers(targetType: NotificationTarget, targetId?: string): Promise<string[]> {
    switch (targetType) {
      case NotificationTarget.ALL: {
        const users = await this.prisma.user.findMany({
          select: { id: true },
          where: { deletedAt: null },
        });
        return users.map((u) => u.id);
      }
      case NotificationTarget.USER: {
        if (!targetId) return [];
        const user = await this.prisma.user.findUnique({
          where: { id: targetId },
          select: { id: true },
        });
        return user ? [user.id] : [];
      }
      case NotificationTarget.ROLE: {
        if (!targetId) return [];
        const users = await this.prisma.user.findMany({
          where: { role: targetId as Prisma.EnumUserRoleFilter['equals'], deletedAt: null },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }
      default:
        return [];
    }
  }
}
