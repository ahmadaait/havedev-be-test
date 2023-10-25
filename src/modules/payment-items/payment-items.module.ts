import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentItem } from './entities/payment-item.entity';
import { PaymentItemsController } from './payment-items.controller';
import { PaymentItemsService } from './payment-items.service';
import { Sale } from '../sales/entities/sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentItem, Payment, PaymentMethod, Sale]),
  ],
  exports: [PaymentItemsService],
  controllers: [PaymentItemsController],
  providers: [PaymentItemsService],
})
export class PaymentItemsModule {}
