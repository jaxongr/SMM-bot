import { IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

const MIN_PAYMENT_AMOUNT = 1000;

export class CreatePaymentDto {
  @ApiProperty({ description: 'Payment amount in soum', example: 10000, minimum: MIN_PAYMENT_AMOUNT })
  @IsNumber()
  @Min(MIN_PAYMENT_AMOUNT, { message: `Minimum payment amount is ${MIN_PAYMENT_AMOUNT} soum` })
  amount: number;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod, example: PaymentMethod.CLICK })
  @IsEnum(PaymentMethod, { message: 'Invalid payment method' })
  method: PaymentMethod;
}
