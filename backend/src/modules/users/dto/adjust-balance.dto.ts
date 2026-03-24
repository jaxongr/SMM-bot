import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustBalanceDto {
  @ApiProperty({ description: 'Amount to adjust. Positive to add, negative to deduct.' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Reason for the balance adjustment' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;
}
