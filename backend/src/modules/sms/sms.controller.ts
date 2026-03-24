import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { BuyNumberDto } from './dto/buy-number.dto';
import { SmsQueryDto } from './dto/sms-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiPaginated } from '../../common/decorators/api-paginated.decorator';

@ApiTags('SMS')
@ApiBearerAuth()
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('services')
  @ApiOperation({ summary: 'Get available SMS activation services' })
  getServices() {
    return this.smsService.getAvailableServices();
  }

  @Get('countries')
  @ApiOperation({ summary: 'Get available countries for SMS activation' })
  getCountries() {
    return this.smsService.getCountries();
  }

  @Get('price')
  @ApiOperation({ summary: 'Get price for SMS activation by service and country' })
  getPrice(
    @Query('service') service: string,
    @Query('country') country: string,
  ) {
    return this.smsService.getPrice(service, country);
  }

  @Post('buy')
  @ApiOperation({ summary: 'Buy a virtual number for SMS activation' })
  buyNumber(
    @CurrentUser('id') userId: string,
    @Body() dto: BuyNumberDto,
  ) {
    return this.smsService.buyNumber(userId, dto);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Check SMS activation status' })
  checkStatus(@Param('id') id: string) {
    return this.smsService.checkStatus(id);
  }

  @Post('cancel/:id')
  @ApiOperation({ summary: 'Cancel SMS activation and get refund' })
  cancelNumber(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.smsService.cancelNumber(id, userId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get user SMS activation orders' })
  @ApiPaginated()
  getUserOrders(
    @CurrentUser('id') userId: string,
    @Query() query: SmsQueryDto,
  ) {
    return this.smsService.getUserOrders(userId, query);
  }
}
