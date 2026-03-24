import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { AdminAdjustDto } from './dto/admin-adjust.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginated } from '../../common/decorators/api-paginated.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Balance')
@Controller('balance')
@ApiBearerAuth()
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user balance' })
  getBalance(@CurrentUser('id') userId: string) {
    return this.balanceService.getBalance(userId);
  }

  @Get('/transactions')
  @ApiOperation({ summary: 'Get transaction history. Users see own transactions, admins can filter by userId.' })
  @ApiPaginated()
  getTransactions(
    @CurrentUser() user: { id: string; role: string },
    @Query() query: TransactionQueryDto,
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const userId = isAdmin && query.userId ? query.userId : user.id;

    return this.balanceService.getTransactions(userId, query);
  }

  @Post('/admin-adjust')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Admin adjust user balance (admin only)' })
  adminAdjust(
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminAdjustDto,
  ) {
    return this.balanceService.adminAdjust(adminId, dto);
  }
}
