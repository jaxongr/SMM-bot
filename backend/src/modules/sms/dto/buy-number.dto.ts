import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BuyNumberDto {
  @ApiProperty({ description: 'Service code (e.g., tg, wa, ig)', example: 'tg' })
  @IsNotEmpty()
  @IsString()
  service: string;

  @ApiProperty({ description: 'Country code (e.g., 0 for Russia, 12 for USA)', example: '0' })
  @IsNotEmpty()
  @IsString()
  country: string;
}
