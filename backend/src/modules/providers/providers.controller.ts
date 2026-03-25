import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { ProviderApiService } from './provider-api.service';
import { ProviderSyncService } from './provider-sync.service';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { CreateMappingDto } from './dto/create-mapping.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Providers')
@ApiBearerAuth()
@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly providerApiService: ProviderApiService,
    private readonly providerSyncService: ProviderSyncService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all providers' })
  findAll() {
    return this.providersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new provider' })
  create(@Body() dto: CreateProviderDto) {
    return this.providersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a provider' })
  update(@Param('id') id: string, @Body() dto: UpdateProviderDto) {
    return this.providersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a provider' })
  deactivate(@Param('id') id: string) {
    return this.providersService.deactivate(id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync services from external provider API' })
  syncServices(@Param('id') id: string) {
    return this.providerSyncService.syncProviderServices(id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Check provider balance from external API' })
  async getBalance(@Param('id') id: string) {
    const { data: provider } = await this.providersService.findById(id);
    const balance = await this.providerApiService.getBalance({
      id: provider.id,
      apiUrl: provider.apiUrl,
      apiKey: provider.apiKey,
    });
    return { data: balance };
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'List provider services' })
  getServices(@Param('id') id: string) {
    return this.providersService.getProviderServices(id);
  }

  @Post('mappings')
  @ApiOperation({ summary: 'Create a service-provider mapping' })
  createMapping(@Body() dto: CreateMappingDto) {
    return this.providersService.createMapping(dto);
  }

  @Delete('mappings/:id')
  @ApiOperation({ summary: 'Delete a service-provider mapping' })
  deleteMapping(@Param('id') id: string) {
    return this.providersService.deleteMapping(id);
  }

  @Get('mappings/service/:serviceId')
  @ApiOperation({ summary: 'Get mappings for a service' })
  getMappingsForService(@Param('serviceId') serviceId: string) {
    return this.providersService.getMappingsForService(serviceId);
  }
}
