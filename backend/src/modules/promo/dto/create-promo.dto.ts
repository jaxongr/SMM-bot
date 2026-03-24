import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PromoType {
  BALANCE_BONUS = 'BALANCE_BONUS',
  DISCOUNT_PERCENT = 'DISCOUNT_PERCENT',
  DISCOUNT_FIXED = 'DISCOUNT_FIXED',
}

export class CreatePromoDto {
  @ApiProperty({ description: 'Unique promo code', example: 'WELCOME2024' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ enum: PromoType, description: 'Promo type' })
  @IsNotEmpty()
  @IsEnum(PromoType)
  type: PromoType;

  @ApiProperty({ description: 'Value: amount for BALANCE_BONUS/DISCOUNT_FIXED, percentage for DISCOUNT_PERCENT', example: 10000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ description: 'Maximum total usages allowed', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsages?: number;

  @ApiPropertyOptional({ description: 'Expiration date (ISO string)', example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Promo description', example: 'Welcome bonus for new users' })
  @IsOptional()
  @IsString()
  description?: string;
}
