import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderDto {
  @ApiProperty({ description: 'Service ID' })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({ description: 'Target link (URL)' })
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  link: string;

  @ApiProperty({ description: 'Quantity to order', minimum: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Drip feed interval in minutes' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dripFeedInterval?: number;

  @ApiPropertyOptional({ description: 'Drip feed quantity per run' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dripFeedQuantity?: number;
}
