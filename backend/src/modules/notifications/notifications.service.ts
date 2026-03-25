import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationTarget, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { buildPaginationMeta, getPaginationParams, PaginationParams } from '../../common/types/response.type';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly botToken: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.botToken = this.configService.get<string>('telegram.botToken', '');
  }

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
      // Create UserNotification records
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

      // Send Telegram messages directly
      this.sendTelegramNotifications(userIds, dto.title as unknown as Record<string, string>, dto.message as unknown as Record<string, string>).catch((err) => {
        this.logger.error(`Failed to send Telegram notifications: ${err}`);
      });
    }

    this.logger.log(`Notification created: id=${notification.id}, target=${dto.targetType}, recipients=${userIds.length}`);

    return { data: notification };
  }

  private async sendTelegramNotifications(
    userIds: string[],
    title: Record<string, string>,
    message: Record<string, string>,
  ) {
    if (!this.botToken) return;

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, isBlocked: false },
      select: { telegramId: true, language: true },
    });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      if (!user.telegramId || user.telegramId === BigInt(0)) continue;

      const lang = user.language || 'uz';
      const titleText = title[lang] || title['uz'] || title['en'] || '';
      const messageText = message[lang] || message['uz'] || message['en'] || '';

      const text = `📢 <b>${titleText}</b>\n\n${messageText}`;

      try {
        await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.telegramId.toString(),
            text,
            parse_mode: 'HTML',
          }),
        });
        sent++;

        // Telegram rate limit: max 30 msg/sec
        if (sent % 25 === 0) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      } catch {
        failed++;
      }
    }

    this.logger.log(`Telegram notifications sent: ${sent} success, ${failed} failed`);
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

    const [userNotifications, total] = await Promise.all([
      this.prisma.userNotification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { notification: true },
      }),
      this.prisma.userNotification.count({ where: { userId } }),
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
