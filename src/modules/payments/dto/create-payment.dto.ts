import { Sale } from 'src/modules/sales/entities/sale.entity';
import { PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
  sale: Sale;

  invoice: string;

  amount: number;

  status: PaymentStatus;
}
