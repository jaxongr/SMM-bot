import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMappingDto {
  @ApiProperty({ description: 'Internal service ID' })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({ description: 'Provider service ID (from ProviderService table)' })
  @IsNotEmpty()
  @IsString()
  providerServiceId: string;

  @ApiProperty({ description: 'Provider ID' })
  @IsNotEmpty()
  @IsString()
  providerId: string;

  @ApiPropertyOptional({ description: 'Mapping priority (higher = preferred)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority?: number;
}
