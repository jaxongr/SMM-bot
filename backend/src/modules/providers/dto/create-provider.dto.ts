import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProviderDto {
  @ApiProperty({ description: 'Provider name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Provider API URL' })
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  apiUrl: string;

  @ApiProperty({ description: 'Provider API key' })
  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @ApiPropertyOptional({ description: 'Provider description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Provider priority (higher = preferred)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority?: number;
}
