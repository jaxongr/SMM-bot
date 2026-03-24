import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiPaginated } from '../../common/decorators/api-paginated.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a new payment' })
  initiate(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.initiate(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List payments. Users see own payments, admins can filter.' })
  @ApiPaginated()
  findAll(
    @CurrentUser() user: { id: string; role: string },
    @Query() query: PaymentQueryDto,
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const userId = isAdmin ? undefined : user.id;

    return this.paymentsService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details' })
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Manually approve a payment (admin only)' })
  approve(@Param('id') id: string) {
    return this.paymentsService.approve(id);
  }
}
