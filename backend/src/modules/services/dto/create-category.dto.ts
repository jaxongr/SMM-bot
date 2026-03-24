import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsInt, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Platform } from '@prisma/client';

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

export class CreateCategoryDto {
  @ApiProperty({ type: LocalizedText, description: 'Localized name { uz, ru, en }' })
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => LocalizedText)
  name: LocalizedText;

  @ApiProperty({ description: 'Unique slug for the category' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ enum: Platform })
  @IsNotEmpty()
  @IsEnum(Platform)
  platform: Platform;

  @ApiPropertyOptional({ description: 'Icon identifier or URL' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
