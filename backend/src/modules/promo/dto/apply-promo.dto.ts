import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyPromoDto {
  @ApiProperty({ description: 'Promo code to apply', example: 'WELCOME2024' })
  @IsNotEmpty()
  @IsString()
  code: string;
}
