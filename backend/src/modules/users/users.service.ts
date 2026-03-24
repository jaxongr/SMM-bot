import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersRepository } from './users.repository';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  PaginatedResponse,
  buildPaginationMeta,
  getPaginationParams,
} from '../../common/types/response.type';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async findAll(query: UserQueryDto): Promise<PaginatedResponse<unknown>> {
    const { page, limit } = getPaginationParams(query);

    const [users, total] = await Promise.all([
      this.usersRepository.findAll(query),
      this.usersRepository.countAll(query),
    ]);

    return {
      data: users,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async findByTelegramId(telegramId: bigint) {
    return this.usersRepository.findByTelegramId(telegramId);
  }

  async findOrCreateFromTelegram(telegramData: CreateUserDto) {
    const telegramId = BigInt(telegramData.telegramId);
    const existingUser = await this.usersRepository.findByTelegramId(telegramId);

    if (existingUser) {
      const updateData: Prisma.UserUpdateInput = {};
      let hasChanges = false;

      if (telegramData.username && telegramData.username !== existingUser.username) {
        updateData.username = telegramData.username;
        hasChanges = true;
      }
      if (telegramData.firstName && telegramData.firstName !== existingUser.firstName) {
        updateData.firstName = telegramData.firstName;
        hasChanges = true;
      }
      if (telegramData.lastName && telegramData.lastName !== existingUser.lastName) {
        updateData.lastName = telegramData.lastName;
        hasChanges = true;
      }

      if (hasChanges) {
        return this.usersRepository.update(existingUser.id, updateData);
      }

      return existingUser;
    }

    const createData: Prisma.UserCreateInput = {
      telegramId,
      username: telegramData.username,
      firstName: telegramData.firstName,
      lastName: telegramData.lastName,
      language: telegramData.language ?? 'uz',
    };

    if (telegramData.referralCode) {
      const referrer = await this.usersRepository.findByReferralCode(telegramData.referralCode);
      if (referrer) {
        createData.referredBy = { connect: { id: referrer.id } };
      }
    }

    const newUser = await this.usersRepository.create(createData);
    this.logger.log(`New user created: telegramId=${telegramId}, id=${newUser.id}`);

    return newUser;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);

    return this.usersRepository.update(id, dto);
  }

  async adjustBalance(id: string, dto: AdjustBalanceDto) {
    const user = await this.findById(id);
    const amount = new Prisma.Decimal(dto.amount);
    const currentBalance = new Prisma.Decimal(user.balance.toString());
    const newBalance = currentBalance.add(amount);

    if (newBalance.lessThan(0)) {
      throw new BadRequestException(
        `Insufficient balance. Current: ${currentBalance}, adjustment: ${amount}`,
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { balance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          userId: id,
          type: TransactionType.ADMIN_ADJUST,
          amount,
          balanceAfter: updatedUser.balance,
          description: dto.description,
        },
      });

      return updatedUser;
    });

    this.logger.log(`Balance adjusted for user ${id}: ${dto.amount} (${dto.description})`);

    return result;
  }

  async toggleBlock(id: string) {
    const user = await this.findById(id);

    const updatedUser = await this.usersRepository.update(id, {
      isBlocked: !user.isBlocked,
    });

    this.logger.log(`User ${id} ${updatedUser.isBlocked ? 'blocked' : 'unblocked'}`);

    return updatedUser;
  }

  async getUserReferrals(id: string, page: number = 1, limit: number = 20) {
    await this.findById(id);

    const safeLimit = Math.min(100, Math.max(1, limit));
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const [referrals, total] = await Promise.all([
      this.usersRepository.findReferrals(id, skip, safeLimit),
      this.usersRepository.countReferrals(id),
    ]);

    return {
      data: referrals,
      meta: buildPaginationMeta(total, safePage, safeLimit),
    };
  }
}
