import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin', description: 'Admin username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'admin123', description: 'Admin password', minLength: 4 })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
