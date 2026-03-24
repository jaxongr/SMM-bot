import { IsBoolean, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LocalizedText {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  uz: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ru: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  en: string;
}

class OptionalLocalizedText {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  uz?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ru?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  en?: string;
}

export class CreateServiceDto {
  @ApiProperty({ description: 'Category ID this service belongs to' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({ type: LocalizedText, description: 'Localized name { uz, ru, en }' })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizedText)
  name: LocalizedText;

  @ApiPropertyOptional({ type: OptionalLocalizedText, description: 'Localized description { uz, ru, en }' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => OptionalLocalizedText)
  description?: OptionalLocalizedText;

  @ApiProperty({ description: 'Minimum quantity per order', minimum: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  minQuantity: number;

  @ApiProperty({ description: 'Maximum quantity per order' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  maxQuantity: number;

  @ApiProperty({ description: 'Price per unit (Decimal)', type: Number })
  @IsNotEmpty()
  @Type(() => Number)
  pricePerUnit: number;

  @ApiPropertyOptional({ description: 'Whether this is an auto-service', default: false })
  @IsOptional()
  @IsBoolean()
  isAutoService?: boolean;

  @ApiPropertyOptional({ description: 'Whether drip feed is supported', default: false })
  @IsOptional()
  @IsBoolean()
  dripFeed?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
