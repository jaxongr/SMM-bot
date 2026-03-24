import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiPaginated } from '../../common/decorators/api-paginated.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders. Users see own orders, admins see all with filters.' })
  @ApiPaginated()
  findAll(
    @CurrentUser() user: { id: string; role: string },
    @Query() query: OrderQueryDto,
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const userId = isAdmin ? undefined : user.id;
    return this.ordersService.findAll(query, userId);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get order statistics (admin only)' })
  getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Request order cancellation' })
  cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    return this.ordersService.cancelOrder(id, user.id, isAdmin);
  }

  @Post(':id/refill')
  @ApiOperation({ summary: 'Request order refill' })
  refillOrder(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    return this.ordersService.refillOrder(id, user.id, isAdmin);
  }
}
