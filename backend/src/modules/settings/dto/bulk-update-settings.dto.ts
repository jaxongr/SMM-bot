import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SettingItem {
  @ApiProperty({ description: 'Setting key' })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ description: 'Setting value (any JSON-compatible value)' })
  @IsNotEmpty()
  value: unknown;
}

export class BulkUpdateSettingsDto {
  @ApiProperty({ description: 'Array of settings to update', type: [SettingItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingItem)
  settings: SettingItem[];
}
