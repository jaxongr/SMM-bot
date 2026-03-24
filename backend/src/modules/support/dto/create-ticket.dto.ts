import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ description: 'Ticket subject' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  subject: string;
}
