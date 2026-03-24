import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminAdjustDto {
  @ApiProperty({ description: 'User ID to adjust balance for' })
  @IsNotEmpty()
  @IsString()
  userId: string;

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
