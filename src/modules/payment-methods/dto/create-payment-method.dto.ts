import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PaymentType } from '../entities/payment-method.entity';

export class CreatePaymentMethodDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  payment_type: PaymentType;
}
