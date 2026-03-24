import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Telegram user ID' })
  @IsNotEmpty()
  @IsNumber()
  telegramId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ default: 'uz' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  language?: string = 'uz';

  @ApiPropertyOptional({ description: 'Referral code of the referrer' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
