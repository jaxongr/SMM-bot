import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, TicketStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { buildPaginationMeta, getPaginationParams } from '../../common/types/response.type';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
      },
      include: {
        user: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
      },
    });

    this.logger.log(`Ticket created: id=${ticket.id}, user=${userId}`);

    return { data: ticket };
  }

  async findAll(query: TicketQueryDto, userId?: string) {
    const { page, limit, skip } = getPaginationParams(query);

    const where: Prisma.SupportTicketWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.userId && !userId) {
      where.userId = query.userId;
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, firstName: true, lastName: true },
          },
          _count: { select: { messages: true } },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, firstName: true, lastName: true, telegramId: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return { data: ticket };
  }

  async sendMessage(ticketId: string, senderId: string, dto: SendMessageDto, isAdmin: boolean) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (!isAdmin && ticket.userId !== senderId) {
      throw new ForbiddenException('You can only send messages to your own tickets');
    }

    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId,
        isAdmin,
        message: dto.message,
        fileUrl: dto.fileUrl,
      },
    });

    if (ticket.status === TicketStatus.OPEN && isAdmin) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.IN_PROGRESS },
      });
    }

    this.logger.log(`Message sent: ticket=${ticketId}, sender=${senderId}, isAdmin=${isAdmin}`);

    return { data: message };
  }

  async updateStatus(ticketId: string, status: TicketStatus) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    this.logger.log(`Ticket status updated: id=${ticketId}, status=${status}`);

    return { data: updated };
  }
}
