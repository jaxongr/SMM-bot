import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { BulkUpdateSettingsDto } from './dto/bulk-update-settings.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Settings')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings (optionally filtered by group)' })
  @ApiQuery({ name: 'group', required: false, type: String, description: 'Filter by settings group' })
  findAll(@Query('group') group?: string) {
    return this.settingsService.findAll(group);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get a single setting by key' })
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update multiple settings' })
  bulkUpdate(@Body() dto: BulkUpdateSettingsDto) {
    return this.settingsService.bulkUpdate(dto.settings);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update a single setting' })
  set(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.set(key, dto.value);
  }
}
