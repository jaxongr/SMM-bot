import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SmsOrderStatus {
  WAITING = 'WAITING',
  RECEIVED = 'RECEIVED',
  CANCELED = 'CANCELED',
  TIMEOUT = 'TIMEOUT',
}

export class SmsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: SmsOrderStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(SmsOrderStatus)
  status?: SmsOrderStatus;
}
