import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BalanceService } from '../balance/balance.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { buildPaginationMeta, getPaginationParams, PaginationParams } from '../../common/types/response.type';

@Injectable()
export class PromoService {
  private readonly logger = new Logger(PromoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly balanceService: BalanceService,
  ) {}

  async create(dto: CreatePromoDto) {
    const existing = await this.prisma.promoCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`Promo code "${dto.code}" already exists`);
    }

    const promoCode = await this.prisma.promoCode.create({
      data: {
        code: dto.code.toUpperCase(),
        type: dto.type,
        value: new Prisma.Decimal(dto.value),
        maxUsages: dto.maxUsages,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        description: dto.description,
      },
    });

    this.logger.log(`Promo code created: ${promoCode.code} (${promoCode.type}, value=${promoCode.value})`);

    return { data: promoCode };
  }

  async findAll(query: PaginationParams) {
    const { page, limit, skip } = getPaginationParams(query);

    const [promoCodes, total] = await Promise.all([
      this.prisma.promoCode.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { usages: true } },
        },
      }),
      this.prisma.promoCode.count(),
    ]);

    return {
      data: promoCodes,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findByCode(code: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    return { data: promoCode };
  }

  async applyPromo(userId: string, code: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    if (!promoCode.isActive) {
      throw new BadRequestException('Promo code is no longer active');
    }

    if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
      throw new BadRequestException('Promo code has expired');
    }

    if (promoCode.maxUsages && promoCode.usedCount >= promoCode.maxUsages) {
      throw new BadRequestException('Promo code usage limit has been reached');
    }

    const existingUsage = await this.prisma.promoUsage.findUnique({
      where: {
        promoId_userId: {
          promoId: promoCode.id,
          userId,
        },
      },
    });

    if (existingUsage) {
      throw new BadRequestException('You have already used this promo code');
    }

    const appliedAmount = Number(promoCode.value);

    return this.prisma.$transaction(async (tx) => {
      await tx.promoCode.update({
        where: { id: promoCode.id },
        data: { usedCount: { increment: 1 } },
      });

      await tx.promoUsage.create({
        data: {
          promoId: promoCode.id,
          userId,
          amount: promoCode.value,
        },
      });

      if (promoCode.type === 'BALANCE_BONUS') {
        await this.balanceService.topUp(
          userId,
          appliedAmount,
          `Promo code bonus: ${promoCode.code}`,
          { type: 'PROMO_BONUS', promoCodeId: promoCode.id, promoCode: promoCode.code },
        );
      }

      this.logger.log(
        `Promo code applied: user=${userId}, code=${promoCode.code}, type=${promoCode.type}, value=${promoCode.value}`,
      );

      return {
        data: {
          code: promoCode.code,
          type: promoCode.type,
          value: promoCode.value,
          message: this.getApplyMessage(promoCode.type, appliedAmount),
        },
      };
    });
  }

  private getApplyMessage(type: string, value: number): string {
    switch (type) {
      case 'BALANCE_BONUS':
        return `${value} so'm balansingizga qo'shildi!`;
      case 'DISCOUNT_PERCENT':
        return `Keyingi buyurtmangizda ${value}% chegirma qo'llaniladi!`;
      case 'DISCOUNT_FIXED':
        return `Keyingi buyurtmangizda ${value} so'm chegirma qo'llaniladi!`;
      default:
        return 'Promo kod muvaffaqiyatli qo\'llanildi!';
    }
  }

  async deactivate(id: string) {
    const promoCode = await this.prisma.promoCode.findUnique({
      where: { id },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }

    const updated = await this.prisma.promoCode.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Promo code deactivated: ${promoCode.code}`);

    return { data: updated };
  }

  async getStats() {
    const [totalCodes, activeCodes, totalUsages, recentUsages] = await Promise.all([
      this.prisma.promoCode.count(),
      this.prisma.promoCode.count({ where: { isActive: true } }),
      this.prisma.promoUsage.count(),
      this.prisma.promoUsage.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          promo: { select: { code: true, type: true } },
        },
      }),
    ]);

    const totalBonusGiven = await this.prisma.promoUsage.aggregate({
      _sum: { amount: true },
    });

    return {
      data: {
        totalCodes,
        activeCodes,
        totalUsages,
        totalBonusGiven: totalBonusGiven._sum.amount || 0,
        recentUsages,
      },
    };
  }
}
