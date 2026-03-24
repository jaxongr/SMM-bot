import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { StatsPeriod } from './types/statistics.types';

@ApiTags('Statistics')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(RolesGuard)
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview stats' })
  getDashboardStats() {
    return this.statisticsService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue chart data' })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month'], required: false })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  getRevenueChart(
    @Query('period') period: StatsPeriod = 'day',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.statisticsService.getRevenueChart(period, dateFrom, dateTo);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get orders statistics by status/service/platform' })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  getOrdersStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.statisticsService.getOrdersStats(dateFrom, dateTo);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user growth data' })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month'], required: false })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  getUserGrowth(
    @Query('period') period: StatsPeriod = 'day',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.statisticsService.getUserGrowth(period, dateFrom, dateTo);
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get provider spending and performance data' })
  getProviderStats() {
    return this.statisticsService.getProviderStats();
  }
}
