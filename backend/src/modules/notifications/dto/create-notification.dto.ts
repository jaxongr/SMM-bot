import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationTarget } from '@prisma/client';

export class LocalizedTextDto {
  @ApiProperty()
  @IsString()
  uz: string;

  @ApiProperty()
  @IsString()
  ru: string;

  @ApiProperty()
  @IsString()
  en: string;
}

export class CreateNotificationDto {
  @ApiProperty({ description: 'Notification title (localized)', type: LocalizedTextDto })
  @IsNotEmpty()
  @IsObject()
  title: LocalizedTextDto;

  @ApiProperty({ description: 'Notification message (localized)', type: LocalizedTextDto })
  @IsNotEmpty()
  @IsObject()
  message: LocalizedTextDto;

  @ApiProperty({ enum: NotificationTarget, description: 'Target audience type' })
  @IsNotEmpty()
  @IsEnum(NotificationTarget)
  targetType: NotificationTarget;

  @ApiPropertyOptional({ description: 'Target ID (userId or role name), required if targetType is USER or ROLE' })
  @ValidateIf((o) => o.targetType === NotificationTarget.USER || o.targetType === NotificationTarget.ROLE)
  @IsNotEmpty({ message: 'targetId is required when targetType is USER or ROLE' })
  @IsString()
  targetId?: string;
}
