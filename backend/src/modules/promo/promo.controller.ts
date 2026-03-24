import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromoService } from './promo.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { ApplyPromoDto } from './dto/apply-promo.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiPaginated } from '../../common/decorators/api-paginated.decorator';
import type { PaginationParams } from '../../common/types/response.type';

@ApiTags('Promo')
@ApiBearerAuth()
@Controller('promo')
export class PromoController {
  constructor(private readonly promoService: PromoService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new promo code (admin only)' })
  create(@Body() dto: CreatePromoDto) {
    return this.promoService.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all promo codes (admin only)' })
  @ApiPaginated()
  findAll(@Query() query: { page?: number; limit?: number }) {
    return this.promoService.findAll(query);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply a promo code (user)' })
  applyPromo(
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyPromoDto,
  ) {
    return this.promoService.applyPromo(userId, dto.code);
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Deactivate a promo code (admin only)' })
  deactivate(@Param('id') id: string) {
    return this.promoService.deactivate(id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get promo usage statistics (admin only)' })
  getStats() {
    return this.promoService.getStats();
  }
}
